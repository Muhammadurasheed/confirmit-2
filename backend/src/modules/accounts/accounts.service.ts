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

  async checkAccount(accountNumber: string, bankCode?: string) {
    this.logger.log(`Checking account: ${accountNumber}`);

    // Hash account number for privacy
    const accountHash = this.hashAccountNumber(accountNumber);

    try {
      // 1. Check if account exists in database
      const accountDoc = await this.db
        .collection('accounts')
        .doc(accountHash)
        .get();

      let accountData: any;

      if (accountDoc.exists) {
        accountData = accountDoc.data();
      } else {
        // 2. Call AI service for reputation check
        const aiServiceUrl = this.configService.get('aiService.url');
        const response = await fetch(`${aiServiceUrl}/check-account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_hash: accountHash, bank_code: bankCode }),
        });

        if (!response.ok) {
          throw new Error(`AI service error: ${response.statusText}`);
        }

        const aiResult = await response.json();

        // 3. Store result
        accountData = {
          account_id: accountHash,
          account_hash: accountHash,
          bank_code: bankCode || null,
          trust_score: aiResult.trust_score,
          risk_level: aiResult.risk_level,
          checks: {
            last_checked: admin.firestore.FieldValue.serverTimestamp(),
            check_count: 1,
            fraud_reports: aiResult.fraud_reports,
            verified_business_id: aiResult.verified_business_id || null,
            flags: aiResult.flags || [],
          },
        };

        await this.db.collection('accounts').doc(accountHash).set(accountData);
      }

      // Update check count
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

  private hashAccountNumber(accountNumber: string): string {
    return crypto.createHash('sha256').update(accountNumber).digest('hex');
  }
}
