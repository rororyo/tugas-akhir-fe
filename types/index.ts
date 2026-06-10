// Actual training data schema — backend expects these exact field names
export interface Transaction {
  transaction_id?: string;
  user_id?: number;
  account_age_days?: number;
  total_transactions_user?: number;
  avg_amount_user?: number;
  amount: number;
  country?: string;
  bin_country?: string;
  channel?: string;
  merchant_category: string;
  promo_used?: number;
  avs_match?: number;
  cvv_result?: number;
  three_ds_flag?: number;
  transaction_time?: string;
  shipping_distance_km?: number;
}

export interface Prediction {
  transaction_id: string;
  user_id?: number | null;
  is_fraud: boolean;
  fraud_probability: number;
}

export interface SingleResult {
  transaction_id: string;
  user_id: number;
  assigned_user_id: boolean;
  fraud_probability: number;
  is_fraud: boolean;
  imputed_fields: string[];
  warning: string | null;
  model_used: string;
  threshold: number;
  processing_time_ms: number;
  timestamp: string;
}

export interface BatchSummary {
  total: number;
  processed: number;
  skipped: number;
  flagged: number;
  fraud_rate: number;
}

export interface DetectionResult {
  predictions: Prediction[];
  skipped?: { transaction_id: string; status: string; reason: string }[];
  batch_summary: BatchSummary;
  model_info: {
    model_name: string;
    f1: number;
  };
  imputed_fields: string[];
  warning: string | null;
  model_used: string;
  threshold: number;
  processing_time_ms: number;
  timestamp: string;
}

export interface FormData {
  user_id: string;
  amount: string;
  merchant_category: string;
  channel: string;
  account_age_days: string;
  shipping_distance_km: string;
  avs_match: string;
  cvv_result: string;
  three_ds_flag: string;
  promo_used: string;
  country: string;
  bin_country: string;
  transaction_time: string;
}

export interface SelectedFeatures {
  amount: boolean;
  merchant_category: boolean;
  channel: boolean;
  account_age_days: boolean;
  shipping_distance_km: boolean;
  avs_match: boolean;
  cvv_result: boolean;
  three_ds_flag: boolean;
  promo_used: boolean;
  country: boolean;
  bin_country: boolean;
  transaction_time: boolean;
}

export type InputMethod = 'file' | 'form';
