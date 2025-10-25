import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { v2 as cloudinary } from 'cloudinary';
import { ScanReceiptDto } from './dto/scan-receipt.dto';
import { ReceiptsGateway } from './receipts.gateway';
import { HederaService } from '../hedera/hedera.service';
import axios from 'axios';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
    private readonly receiptsGateway: ReceiptsGateway,
    private readonly hederaService: HederaService,
  ) {}

  async scanReceipt(file: Express.Multer.File, dto: ScanReceiptDto) {
    const receiptId = this.generateReceiptId();
    this.logger.log(`Starting receipt scan: ${receiptId}`);

    try {
      // 1. Upload to Cloudinary
      this.receiptsGateway.emitProgress(receiptId, 10, 'upload_complete', 'Uploading image...');
      const uploadResult = await this.uploadToCloudinary(file);

      // 2. Create receipt document
      await this.db.collection('receipts').doc(receiptId).set({
        receipt_id: receiptId,
        user_id: dto.userId || 'anonymous',
        storage_path: uploadResult.secure_url,
        cloudinary_public_id: uploadResult.public_id,
        upload_timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'processing',
        analysis: null,
        hedera_anchor: null,
      });

      // 3. Start async analysis
      this.analyzeReceiptAsync(receiptId, uploadResult.secure_url, dto.anchorOnHedera);

      return {
        success: true,
        receiptId,
        message: 'Receipt scan initiated',
      };
    } catch (error) {
      this.logger.error(`Receipt scan failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async analyzeReceiptAsync(
    receiptId: string,
    imageUrl: string,
    anchorOnHedera: boolean,
  ) {
    const receiptRef = this.db.collection('receipts').doc(receiptId);
    const startTime = Date.now();

    try {
      // Send progress updates
      this.receiptsGateway.emitProgress(receiptId, 20, 'ocr_started', 'Extracting text with AI...');

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate OCR

      this.receiptsGateway.emitProgress(receiptId, 40, 'forensics_running', 'Running forensic analysis...');

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate forensics

      // Call AI service
      const aiServiceUrl = this.configService.get('aiService.url');
      this.logger.log(`Calling AI service: ${aiServiceUrl}/analyze-receipt`);

      const aiResponse = await axios.post(
        `${aiServiceUrl}/analyze-receipt`,
        {
          image_url: imageUrl,
          receipt_id: receiptId,
        },
        {
          timeout: 60000, // 60 second timeout
        },
      );

      const analysisResult = aiResponse.data;

      this.receiptsGateway.emitProgress(receiptId, 80, 'analysis_complete', 'Analysis complete!');

      // Store results
      await receiptRef.update({
        analysis: {
          trust_score: analysisResult.trust_score,
          verdict: analysisResult.verdict,
          issues: analysisResult.issues || [],
          recommendation: analysisResult.recommendation,
          forensic_details: {
            ocr_confidence: analysisResult.forensic_details?.ocr_confidence || 0,
            manipulation_score: analysisResult.forensic_details?.manipulation_score || 0,
            metadata_flags: analysisResult.forensic_details?.metadata_flags || [],
            agent_logs: analysisResult.agent_logs || [],
          },
          merchant: analysisResult.merchant || null,
        },
        processing_time: Date.now() - startTime,
        status: 'completed',
      });

      // Anchor to Hedera if requested
      if (anchorOnHedera) {
        this.receiptsGateway.emitProgress(receiptId, 90, 'hedera_anchoring', 'Anchoring to blockchain...');

        const hederaResult = await this.hederaService.anchorToHCS(receiptId, analysisResult);

        await receiptRef.update({
          hedera_anchor: hederaResult,
        });

        this.receiptsGateway.emitProgress(receiptId, 100, 'hedera_anchored', 'Verified on blockchain!');
      } else {
        this.receiptsGateway.emitProgress(receiptId, 100, 'complete', 'Verification complete!');
      }

      // Send final results
      const finalDoc = await receiptRef.get();
      this.receiptsGateway.emitComplete(receiptId, finalDoc.data());

      this.logger.log(`Receipt analysis completed: ${receiptId} in ${Date.now() - startTime}ms`);
    } catch (error) {
      this.logger.error(`Receipt analysis failed for ${receiptId}: ${error.message}`, error.stack);

      await receiptRef.update({
        status: 'failed',
        error: error.message,
      });

      this.receiptsGateway.emitProgress(receiptId, 0, 'failed', `Analysis failed: ${error.message}`);
    }
  }

  async getReceipt(receiptId: string) {
    const doc = await this.db.collection('receipts').doc(receiptId).get();

    if (!doc.exists) {
      throw new Error('Receipt not found');
    }

    return {
      success: true,
      data: doc.data(),
    };
  }

  async getUserReceipts(userId: string) {
    const snapshot = await this.db
      .collection('receipts')
      .where('user_id', '==', userId)
      .orderBy('upload_timestamp', 'desc')
      .limit(50)
      .get();

    const receipts = snapshot.docs.map((doc) => doc.data());

    return {
      success: true,
      count: receipts.length,
      data: receipts,
    };
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'confirmit/receipts',
          resource_type: 'image',
          transformation: [{ quality: 'auto:best' }, { fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  private generateReceiptId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `RCP-${timestamp}${random}`.toUpperCase();
  }
}
