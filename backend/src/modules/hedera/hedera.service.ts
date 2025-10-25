import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  AccountId,
  PrivateKey,
  TopicMessageSubmitTransaction,
  TopicId,
} from '@hashgraph/sdk';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

@Injectable()
export class HederaService {
  private readonly logger = new Logger(HederaService.name);
  private readonly client: Client;
  private readonly db = admin.firestore();

  constructor(private readonly configService: ConfigService) {
    // Initialize Hedera client
    const accountId = AccountId.fromString(
      this.configService.get('hedera.accountId'),
    );
    const privateKey = PrivateKey.fromString(
      this.configService.get('hedera.privateKey'),
    );

    const network = this.configService.get('hedera.network');

    if (network === 'testnet') {
      this.client = Client.forTestnet();
    } else {
      this.client = Client.forMainnet();
    }

    this.client.setOperator(accountId, privateKey);
    this.logger.log('Hedera client initialized');
  }

  async anchorToHCS(entityId: string, data: any): Promise<any> {
    this.logger.log(`Anchoring ${entityId} to Hedera HCS`);

    try {
      // 1. Create SHA-256 hash of data
      const dataHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex');

      const topicId = TopicId.fromString(
        this.configService.get('hedera.topicId'),
      );

      // 2. Submit message to HCS topic
      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(
          JSON.stringify({
            entity_id: entityId,
            data_hash: dataHash,
            timestamp: new Date().toISOString(),
          }),
        )
        .execute(this.client);

      // 3. Get receipt
      const receipt = await transaction.getReceipt(this.client);
      const consensusTimestamp = receipt.consensusTimestamp;

      const anchor = {
        transaction_id: transaction.transactionId.toString(),
        consensus_timestamp: consensusTimestamp.toString(),
        message_hash: dataHash,
        explorer_url: `https://hashscan.io/${this.configService.get('hedera.network')}/transaction/${transaction.transactionId}`,
      };

      // 4. Store anchor info in Firestore
      await this.db.collection('hedera_anchors').add({
        entity_type: 'receipt',
        entity_id: entityId,
        ...anchor,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      this.logger.log(`Successfully anchored ${entityId} to Hedera`);

      return anchor;
    } catch (error) {
      this.logger.error(`Hedera anchoring failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verifyAnchor(transactionId: string): Promise<boolean> {
    try {
      const anchorDoc = await this.db
        .collection('hedera_anchors')
        .where('transaction_id', '==', transactionId)
        .get();

      return !anchorDoc.empty;
    } catch (error) {
      this.logger.error(`Anchor verification failed: ${error.message}`);
      return false;
    }
  }
}
