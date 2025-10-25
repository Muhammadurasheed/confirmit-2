import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);
  private readonly db = admin.firestore();

  async registerBusiness(data: any) {
    this.logger.log(`Registering business: ${data.name}`);

    const businessId = this.generateBusinessId();

    try {
      const businessData = {
        business_id: businessId,
        name: data.name,
        category: data.category,
        contact: {
          email: data.email,
          phone: data.phone,
          address: data.address,
        },
        bank_account: {
          number_encrypted: this.encryptData(data.accountNumber),
          bank_code: data.bankCode,
          account_name: data.accountName,
          verified: false,
        },
        verification: {
          tier: data.tier || 1,
          status: 'pending',
          verified: false,
          documents: data.documents || {},
        },
        trust_score: 0,
        rating: 0,
        review_count: 0,
        stats: {
          profile_views: 0,
          verifications: 0,
          successful_transactions: 0,
        },
        api_keys: [],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.db.collection('businesses').doc(businessId).set(businessData);

      return {
        success: true,
        business_id: businessId,
        message: 'Business registered successfully. Awaiting verification.',
      };
    } catch (error) {
      this.logger.error(`Business registration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getBusiness(businessId: string) {
    const doc = await this.db.collection('businesses').doc(businessId).get();

    if (!doc.exists) {
      throw new Error('Business not found');
    }

    return {
      success: true,
      data: doc.data(),
    };
  }

  async generateApiKey(businessId: string) {
    const apiKey = this.generateSecureApiKey();
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    await this.db
      .collection('businesses')
      .doc(businessId)
      .update({
        api_keys: admin.firestore.FieldValue.arrayUnion({
          key_id: keyHash.substring(0, 8),
          key_hash: keyHash,
          environment: 'production',
          created_at: new Date().toISOString(),
        }),
      });

    return {
      success: true,
      api_key: apiKey,
      message: 'API key generated. Store it securely - it will not be shown again.',
    };
  }

  async getBusinessStats(businessId: string) {
    const doc = await this.db.collection('businesses').doc(businessId).get();

    if (!doc.exists) {
      throw new Error('Business not found');
    }

    const business = doc.data();

    return {
      success: true,
      stats: business.stats,
      trust_score: business.trust_score,
      rating: business.rating,
      review_count: business.review_count,
    };
  }

  private generateBusinessId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `BIZ-${timestamp}${random}`.toUpperCase();
  }

  private generateSecureApiKey(): string {
    return `ck_${crypto.randomBytes(32).toString('hex')}`;
  }

  private encryptData(data: string): string {
    // Simple base64 encoding for now - use proper encryption in production
    return Buffer.from(data).toString('base64');
  }
}
