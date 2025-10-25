import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { v2 as cloudinary } from 'cloudinary';
import { ScanReceiptDto } from './dto/scan-receipt.dto';
import { ReceiptsGateway } from './receipts.gateway';
import { HederaService } from '../hedera/hedera.service';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);
  private readonly db = admin.firestore();

  constructor(
    private readonly configService: ConfigService,
    private readonly receiptsGateway: ReceiptsGateway,
    private readonly hederaService: HederaService,
  ) {}

  async scanReceipt(file: Express.Multer.File, dto: ScanReceiptDto) {
    const receiptId = this.generateReceiptId();
    this.logger.log(`Starting receipt scan: ${receiptId}`);

    try {
      // 1. Upload to Cloudinary
      this.receiptsGateway.emitProgress(receiptId, 10, 'Uploading image...');
      const uploadResult = await this.uploadToCloudinary(file);

      // 2. Create receipt document
      await this.db.collection('receipts').doc(receiptId).set({
        receipt_id: receiptId,
        user_id: dto.userId || null,
        storage_path: uploadResult.secure_url,
        cloudinary_public_id: uploadResult.public_id,
        upload_timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'processing',
      });

      // 3. Call AI service for analysis
      this.receiptsGateway.emitProgress(receiptId, 30, 'Analyzing receipt with AI...');
      const analysisResult = await this.analyzeReceipt(uploadResult.secure_url);

      // 4. Update receipt with results
      await this.db.collection('receipts').doc(receiptId).update({
        analysis: analysisResult,
        status: 'completed',
        processing_time: analysisResult.processing_time_ms,
      });

      this.receiptsGateway.emitProgress(receiptId, 90, 'Analysis complete!');

      // 5. Optionally anchor to Hedera
      if (dto.anchorOnHedera) {
        this.receiptsGateway.emitProgress(receiptId, 95, 'Anchoring to blockchain...');
        const anchor = await this.hederaService.anchorToHCS(receiptId, analysisResult);
        
        await this.db.collection('receipts').doc(receiptId).update({
          hedera_anchor: anchor,
        });
      }

      this.receiptsGateway.emitProgress(receiptId, 100, 'Complete!');

      return {
        success: true,
        receipt_id: receiptId,
        analysis: analysisResult,
      };
    } catch (error) {
      this.logger.error(`Receipt scan failed: ${error.message}`, error.stack);
      
      await this.db.collection('receipts').doc(receiptId).update({
        status: 'failed',
        error: error.message,
      });

      throw error;
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

    const receipts = snapshot.docs.map(doc => doc.data());

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
          transformation: [
            { quality: 'auto:best' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  private async analyzeReceipt(imageUrl: string): Promise<any> {
    const aiServiceUrl = this.configService.get('aiService.url');
    
    const response = await fetch(`${aiServiceUrl}/analyze-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    return response.json();
  }

  private generateReceiptId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `RCP-${timestamp}${random}`.toUpperCase();
  }
}
