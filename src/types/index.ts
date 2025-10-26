// Core Types for ConfirmIT/Legit Platform

export type TrustVerdict = "authentic" | "suspicious" | "fraudulent" | "unclear";
export type RiskLevel = "high" | "medium" | "low";
export type IssueSeverity = "high" | "medium" | "low";
export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";
export type BusinessTier = 1 | 2 | 3;
export type VerificationStatus = "pending" | "under_review" | "approved" | "rejected";

// Receipt Types
export interface Receipt {
  receiptId: string;
  userId?: string;
  storagePath: string;
  uploadTimestamp: Date;
  analysis: AnalysisResult | null;
  hederaAnchor?: HederaAnchor;
  status: AnalysisStatus;
  processingTime?: number;
}

export interface AnalysisResult {
  trustScore: number;
  verdict: TrustVerdict;
  issues: Issue[];
  recommendation: string;
  forensicDetails: ForensicDetails;
  merchant?: MerchantInfo;
}

export interface Issue {
  type: string;
  severity: IssueSeverity;
  description: string;
}

export interface ForensicDetails {
  ocrConfidence: number;
  manipulationScore: number;
  metadataFlags: string[];
  agentLogs?: AgentLog[];
}

export interface AgentLog {
  agent: string;
  status: string;
  timestamp: Date;
  details?: string;
}

export interface MerchantInfo {
  name: string;
  verified: boolean;
  trustScore: number;
}

export interface HederaAnchor {
  transactionId: string;
  consensusTimestamp: string;
  explorerUrl: string;
  hash: string;
}

// Account Types
export interface AccountCheck {
  accountId: string;
  accountHash: string;
  bankCode?: string;
  trustScore: number;
  riskLevel: RiskLevel;
  checks: AccountCheckDetails;
}

export interface AccountCheckDetails {
  lastChecked: Date;
  checkCount: number;
  fraudReports: FraudReportSummary;
  verifiedBusinessId?: string;
  flags: Issue[];
}

export interface FraudReportSummary {
  total: number;
  recent30Days: number;
  patterns: string[];
}

// Business Types
export interface Business {
  businessId: string;
  name: string;
  category: string;
  contact: ContactInfo;
  bankAccount: BankAccountInfo;
  verification: VerificationInfo;
  trustScore: number;
  rating: number;
  reviewCount: number;
  stats: BusinessStats;
  apiKeys?: ApiKey[];
  hedera?: HederaInfo;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface BankAccountInfo {
  numberEncrypted: string;
  bankCode: string;
  accountName: string;
  verified: boolean;
}

export interface VerificationInfo {
  tier: BusinessTier;
  status: VerificationStatus;
  verified: boolean;
  documents: VerificationDocuments;
}

export interface VerificationDocuments {
  cacCertificate?: string;
  governmentId?: string;
  proofOfAddress?: string;
  bankStatement?: string;
}

export interface BusinessStats {
  profileViews: number;
  verifications: number;
  successfulTransactions: number;
}

export interface ApiKey {
  keyId: string;
  keyHash: string;
  environment: "test" | "live";
  createdAt: Date;
}

export interface HederaInfo {
  trustIdNft?: {
    tokenId: string;
    serialNumber: string;
    explorerUrl: string;
  };
  walletAddress?: string;
}

// Fraud Report Types
export interface FraudReport {
  reportId: string;
  accountHash: string;
  reporterId: string;
  report: FraudReportDetails;
  evidence: FraudEvidence;
  status: "pending" | "verified" | "disputed" | "resolved";
  votes: FraudReportVotes;
  reportedAt: Date;
}

export interface FraudReportDetails {
  businessName: string;
  description: string;
  amountLost: number;
  currency: string;
}

export interface FraudEvidence {
  receiptId?: string;
  screenshots?: string[];
  additionalInfo?: string;
}

export interface FraudReportVotes {
  helpful: number;
  notHelpful: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
