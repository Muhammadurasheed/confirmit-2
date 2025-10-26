import { API_BASE_URL } from '@/lib/constants';

export interface CheckAccountRequest {
  accountNumber: string;
  bankCode?: string;
  businessName?: string;
}

export interface FraudReport {
  total: number;
  recent_30_days: number;
  categories?: {
    type: string;
    count: number;
  }[];
}

export interface VerifiedBusiness {
  business_id: string;
  name: string;
  verified: boolean;
  trust_score: number;
  verification_date: string;
}

export interface AccountCheckResult {
  success: boolean;
  data: {
    account_id: string;
    account_hash: string;
    bank_code: string | null;
    trust_score: number;
    risk_level: "low" | "medium" | "high";
    checks: {
      last_checked: string;
      check_count: number;
      fraud_reports: FraudReport;
      verified_business_id: string | null;
      flags: string[];
    };
    verified_business?: VerifiedBusiness;
  };
}

export class AccountsService {
  private static instance: AccountsService;

  private constructor() {}

  static getInstance(): AccountsService {
    if (!AccountsService.instance) {
      AccountsService.instance = new AccountsService();
    }
    return AccountsService.instance;
  }

  async checkAccount(request: CheckAccountRequest): Promise<AccountCheckResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: request.accountNumber,
          bank_code: request.bankCode,
          business_name: request.businessName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Account check failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Account check error:', error);
      throw error;
    }
  }

  async getAccount(accountId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch account: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get account error:', error);
      throw error;
    }
  }

  async reportFraud(accountNumber: string, category: string, description: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/report-fraud`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: accountNumber,
          category,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error(`Fraud report failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Report fraud error:', error);
      throw error;
    }
  }
}

export const accountsService = AccountsService.getInstance();
