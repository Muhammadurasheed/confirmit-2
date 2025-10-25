import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        if (!admin.apps.length) {
          const privateKey = configService
            .get<string>('firebase.privateKey')
            ?.replace(/\\n/g, '\n');

          if (!privateKey || !configService.get('firebase.projectId')) {
            throw new Error(
              'Firebase configuration is incomplete. Check your .env file.',
            );
          }

          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: configService.get('firebase.projectId'),
              privateKey: privateKey,
              clientEmail: configService.get('firebase.clientEmail'),
            }),
            databaseURL: configService.get('firebase.databaseURL'),
            storageBucket: `${configService.get('firebase.projectId')}.appspot.com`,
          });
        }
        return admin;
      },
      inject: [ConfigService],
    },
    {
      provide: 'FIRESTORE',
      useFactory: () => admin.firestore(),
    },
    {
      provide: 'FIREBASE_AUTH',
      useFactory: () => admin.auth(),
    },
    {
      provide: 'FIREBASE_STORAGE',
      useFactory: () => admin.storage(),
    },
  ],
  exports: ['FIREBASE_ADMIN', 'FIRESTORE', 'FIREBASE_AUTH', 'FIREBASE_STORAGE'],
})
export class FirebaseModule {}
