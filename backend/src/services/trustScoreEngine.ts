import { DetectedIndicator } from './securityRuleService.js';

export interface TrustScoreResult {
  trustScore: number;
  riskLevel: 'SAFE' | 'REVIEW' | 'HIGH_RISK' | 'CRITICAL';
  totalImpactPenalty: number;
}

export function calculateTrustScore(indicators: DetectedIndicator[]): TrustScoreResult {
  const BASE_SCORE = 100;
  
  const totalImpactPenalty = indicators.reduce((acc, ind) => acc + ind.impact, 0);
  
  const trustScore = Math.max(0, Math.min(100, BASE_SCORE - totalImpactPenalty));

  let riskLevel: 'SAFE' | 'REVIEW' | 'HIGH_RISK' | 'CRITICAL' = 'SAFE';

  if (trustScore >= 80) {
    riskLevel = 'SAFE';
  } else if (trustScore >= 60) {
    riskLevel = 'REVIEW';
  } else if (trustScore >= 35) {
    riskLevel = 'HIGH_RISK';
  } else {
    riskLevel = 'CRITICAL';
  }

  return {
    trustScore,
    riskLevel,
    totalImpactPenalty
  };
}
