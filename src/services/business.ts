import { API_ENDPOINTS } from "@/lib/constants";
import { ApiResponse, Business, BusinessStats } from "@/types";

export interface RegisterBusinessData {
  name: string;
  category: string;
  email: string;
  phone: string;
  address: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  tier: number;
  documents: {
    cacCertificate?: string;
    governmentId?: string;
    proofOfAddress?: string;
    bankStatement?: string;
  };
}

export const registerBusiness = async (
  data: RegisterBusinessData
): Promise<{ success: boolean; business_id: string; message: string }> => {
  const response = await fetch(API_ENDPOINTS.REGISTER_BUSINESS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to register business");
  }

  return response.json();
};

export const getBusiness = async (
  businessId: string
): Promise<ApiResponse<Business>> => {
  const response = await fetch(API_ENDPOINTS.GET_BUSINESS(businessId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch business");
  }

  return response.json();
};

export const getBusinessStats = async (businessId: string): Promise<{
  success: boolean;
  stats: BusinessStats;
  trust_score: number;
  rating: number;
  review_count: number;
}> => {
  const response = await fetch(`${API_ENDPOINTS.GET_BUSINESS(businessId)}/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch business stats");
  }

  return response.json();
};

export const generateApiKey = async (
  businessId: string
): Promise<{ success: boolean; api_key: string; message: string }> => {
  const response = await fetch(`${API_ENDPOINTS.GET_BUSINESS(businessId)}/api-keys/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ businessId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate API key");
  }

  return response.json();
};
