import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
  ) {}

  async checkAccount(
    accountNumber: string,
    bankCode?: string,
    businessName?: string,
  ) {
    this.logger.log(`Checking account: ${accountNumber.slice(0, 4)}****`);

    // Hash account number for privacy
    const accountHash = this.hashAccountNumber(accountNumber);

    try {
      // 1. Check if account exists in database (with recent check)
      const accountDoc = await this.db
        .collection('accounts')
        .doc(accountHash)
        .get();

      let accountData: any;
      const shouldRefresh =
        !accountDoc.exists ||
        Date.now() - accountDoc.data()?.checks?.last_checked?.toMillis() >
          7 * 24 * 60 * 60 * 1000; // 7 days

      if (accountDoc.exists && !shouldRefresh) {
        // Use cached data
        accountData = accountDoc.data();
        this.logger.log('Using cached account data');
      } else {
        // 2. Call AI service for reputation check
        const aiServiceUrl = this.configService.get('aiService.url');
        this.logger.log(`Calling AI service: ${aiServiceUrl}/api/check-account`);

        const response = await fetch(`${aiServiceUrl}/api/check-account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_hash: accountHash,
            bank_code: bankCode,
            business_name: businessName,
          }),
        });

        if (!response.ok) {
          throw new Error(`AI service error: ${response.statusText}`);
        }

        const aiResult = await response.json();

        // 3. Check if linked to verified business
        let verifiedBusiness = null;
        if (aiResult.verified_business_id) {
          const businessDoc = await this.db
            .collection('businesses')
            .doc(aiResult.verified_business_id)
            .get();

          if (businessDoc.exists) {
            const businessData = businessDoc.data();
            verifiedBusiness = {
              business_id: businessDoc.id,
              name: businessData.business_name,
              verified: businessData.verification_status === 'approved',
              trust_score: businessData.trust_score || 0,
              verification_date: businessData.verification_date,
            };
          }
        }

        // 4. Store result
        accountData = {
          account_id: accountHash,
          account_hash: accountHash,
          bank_code: bankCode || null,
          trust_score: aiResult.trust_score,
          risk_level: aiResult.risk_level,
          checks: {
            last_checked: admin.firestore.FieldValue.serverTimestamp(),
            check_count: accountDoc.exists
              ? accountDoc.data().checks?.check_count + 1
              : 1,
            fraud_reports: aiResult.fraud_reports,
            verified_business_id: aiResult.verified_business_id || null,
            flags: aiResult.flags || [],
          },
          verified_business: verifiedBusiness,
        };

        await this.db.collection('accounts').doc(accountHash).set(accountData);
      }

      // Update check count and timestamp
      await this.db
        .collection('accounts')
        .doc(accountHash)
        .update({
          'checks.last_checked': admin.firestore.FieldValue.serverTimestamp(),
          'checks.check_count': admin.firestore.FieldValue.increment(1),
        });

      return {
        success: true,
        data: accountData,
      };
    } catch (error) {
      this.logger.error(`Account check failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async reportFraud(
    accountNumber: string,
    category: string,
    description: string,
  ) {
    this.logger.log(`Fraud report for account: ${accountNumber.slice(0, 4)}****`);

    const accountHash = this.hashAccountNumber(accountNumber);

    try {
      // 1. Create fraud report document
      const reportRef = await this.db.collection('fraud_reports').add({
        account_hash: accountHash,
        category,
        description,
        reported_at: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
      });

      // 2. Update account fraud counter
      const accountRef = this.db.collection('accounts').doc(accountHash);
      const accountDoc = await accountRef.get();

      if (accountDoc.exists) {
        await accountRef.update({
          'checks.fraud_reports.total': admin.firestore.FieldValue.increment(1),
          'checks.fraud_reports.recent_30_days':
            admin.firestore.FieldValue.increment(1),
        });
      } else {
        // Create new account record with fraud report
        await accountRef.set({
          account_id: accountHash,
          account_hash: accountHash,
          trust_score: 30, // Low score for first fraud report
          risk_level: 'high',
          checks: {
            fraud_reports: {
              total: 1,
              recent_30_days: 1,
            },
            flags: ['Reported for fraudulent activity'],
          },
        });
      }

      this.logger.log(`Fraud report created: ${reportRef.id}`);

      return {
        success: true,
        message: 'Fraud report submitted successfully',
        report_id: reportRef.id,
      };
    } catch (error) {
      this.logger.error(`Fraud report failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAccount(accountId: string) {
    const doc = await this.db.collection('accounts').doc(accountId).get();

    if (!doc.exists) {
      throw new Error('Account not found');
    }

    return {
      success: true,
      data: doc.data(),
    };
  }

  async resolveAccount(accountNumber: string, bankCode: string) {
    this.logger.log(`Resolving account: ${accountNumber.slice(0, 4)}**** for bank: ${bankCode}`);

    const paystackSecretKey = this.configService.get('PAYSTACK_SECRET_KEY');
    
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    try {
      const response = await fetch(
        `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        this.logger.error(`Paystack resolution failed: ${data.message}`);
        return {
          success: false,
          error: data.message || 'Failed to resolve account',
        };
      }

      this.logger.log(`Account resolved successfully: ${data.data.account_name}`);

      return {
        success: true,
        data: {
          account_number: data.data.account_number,
          account_name: data.data.account_name,
          bank_id: data.data.bank_id,
        },
      };
    } catch (error) {
      this.logger.error(`Account resolution error: ${error.message}`, error.stack);
      return {
        success: false,
        error: 'Failed to resolve account. Please verify the account number and bank code.',
      };
    }
  }

  private hashAccountNumber(accountNumber: string): string {
    return crypto.createHash('sha256').update(accountNumber).digest('hex');
  }
}
