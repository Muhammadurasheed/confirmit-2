// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.legit.africa';
export const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'https://ai.legit.africa';

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

// Hedera Configuration
export const HEDERA_CONFIG = {
  network: import.meta.env.VITE_HEDERA_NETWORK || 'testnet',
  explorerUrl: 'https://hashscan.io/testnet',
};

// Business Tiers
export const BUSINESS_TIERS = {
  1: { name: 'Basic', price: 0, features: ['Basic verification', 'Profile listing'] },
  2: { name: 'Verified', price: 25000, features: ['Full verification', 'Trust badge', 'Priority listing'] },
  3: { name: 'Premium', price: 75000, features: ['Premium verification', 'API access', 'Analytics', 'White-label'] },
} as const;

// Trust Score Thresholds
export const TRUST_SCORE_THRESHOLDS = {
  high: 80,
  medium: 50,
  low: 0,
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  SCAN_RECEIPT: `${API_BASE_URL}/api/receipts/scan`,
  CHECK_ACCOUNT: `${API_BASE_URL}/api/accounts/check`,
  RESOLVE_ACCOUNT: `${API_BASE_URL}/api/accounts/resolve`,
  REGISTER_BUSINESS: `${API_BASE_URL}/api/business/register`,
  GET_BUSINESS: (id: string) => `${API_BASE_URL}/api/business/${id}`,
  GENERATE_API_KEY: `${API_BASE_URL}/api/business/api-keys/generate`,
  GET_BUSINESS_STATS: (id: string) => `${API_BASE_URL}/api/business/stats/${id}`,
} as const;
