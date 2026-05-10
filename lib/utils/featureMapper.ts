import { DETECTION_FEATURES } from '../constants';
import type { SelectedFeatures } from '@/types';

/**
 * Maps selected features to backend field names
 */
export function mapFeaturesToBackend(selectedFeatures: SelectedFeatures): string[] {
  const enabledFields: string[] = [];
  
  Object.entries(selectedFeatures).forEach(([key, enabled]) => {
    if (enabled) {
      const feature = DETECTION_FEATURES.find(f => f.key === key);
      if (feature) {
        enabledFields.push(feature.backendField);
      }
    }
  });
  
  return enabledFields;
}

/**
 * Validates if transaction has required fields
 */
export function validateTransaction(transaction: any): { valid: boolean; missing: string[] } {
  const requiredFields = DETECTION_FEATURES
    .filter(f => f.required)
    .map(f => f.backendField);
  
  const missing = requiredFields.filter(field => {
    const value = transaction[field];
    return value === undefined || value === null || value === '';
  });
  
  return {
    valid: missing.length === 0,
    missing
  };
}