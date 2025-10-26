import { Injectable, Logger, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { HederaService } from '../hedera/hedera.service';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);
  private readonly db = admin.firestore();

  constructor(private readonly hederaService: HederaService) {}

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

  /**
   * Approve business verification and mint Trust ID NFT
   */
  async approveVerification(businessId: string, approvedBy: string) {
    this.logger.log(`Approving verification for business: ${businessId}`);

    try {
      const doc = await this.db.collection('businesses').doc(businessId).get();

      if (!doc.exists) {
        throw new Error('Business not found');
      }

      const business = doc.data();

      // Calculate initial trust score based on tier
      const initialTrustScore = this.calculateInitialTrustScore(
        business.verification.tier,
      );

      // Mint Trust ID NFT on Hedera
      const nftData = await this.hederaService.mintTrustIdNFT(
        businessId,
        business.name,
        initialTrustScore,
        business.verification.tier,
      );

      // Update business document
      await this.db
        .collection('businesses')
        .doc(businessId)
        .update({
          'verification.status': 'approved',
          'verification.verified': true,
          'verification.approved_at': admin.firestore.FieldValue.serverTimestamp(),
          'verification.approved_by': approvedBy,
          trust_score: initialTrustScore,
          hedera: {
            trust_id_nft: {
              token_id: nftData.token_id,
              serial_number: nftData.serial_number,
              explorer_url: nftData.explorer_url,
            },
          },
        });

      this.logger.log(
        `Business ${businessId} verified successfully with NFT ${nftData.serial_number}`,
      );

      return {
        success: true,
        business_id: businessId,
        trust_score: initialTrustScore,
        nft: nftData,
        message: 'Business verified successfully and Trust ID NFT minted',
      };
    } catch (error) {
      this.logger.error(
        `Business verification failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update business trust score and anchor to Hedera
   */
  async updateTrustScore(businessId: string, newTrustScore: number) {
    this.logger.log(
      `Updating trust score for ${businessId} to ${newTrustScore}`,
    );

    try {
      // Update trust score and anchor change to Hedera
      const hederaUpdate = await this.hederaService.updateTrustScore(
        businessId,
        newTrustScore,
      );

      // Update business document
      await this.db
        .collection('businesses')
        .doc(businessId)
        .update({
          trust_score: newTrustScore,
          last_trust_update: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        business_id: businessId,
        new_trust_score: newTrustScore,
        hedera_anchor: hederaUpdate.hedera_anchor,
      };
    } catch (error) {
      this.logger.error(
        `Trust score update failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private calculateInitialTrustScore(tier: number): number {
    // Tier-based initial trust scores
    const scores = {
      1: 50, // Basic: Starting trust
      2: 70, // Verified: Higher initial trust
      3: 85, // Premium: High initial trust
    };
    return scores[tier] || 50;
  }
}
