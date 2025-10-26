import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Load .env before anything else
  dotenv.config();

  // ✅ Initialize Firebase BEFORE Nest starts
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
      });
      console.log('🔥 Firebase initialized at bootstrap');
    } catch (err) {
      console.error('❌ Firebase failed to initialize at bootstrap:', err);
      process.exit(1);
    }
  }

  // Now create the Nest app
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('ConfirmIT API')
    .setDescription('AI-powered trust verification API for African commerce')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('receipts', 'Receipt verification endpoints')
    .addTag('accounts', 'Account checking endpoints')
    .addTag('business', 'Business directory endpoints')
    .addTag('hedera', 'Blockchain integration endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);

  console.log(`
  🚀 ConfirmIT Backend API is running!

  📡 Server: http://localhost:${port}
  📚 API Docs: http://localhost:${port}/api/docs
  🔥 Environment: ${process.env.NODE_ENV || 'development'}

  Bismillah - Building trust for African commerce! 🌍
  `);
}

bootstrap();
