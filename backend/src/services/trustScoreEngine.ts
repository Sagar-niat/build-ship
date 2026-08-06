import { DetectedIndicator } from './securityRuleService.js';

export type SecurityCategory = 
  | 'SAFE'
  | 'SPAM'
  | 'PHISHING'
  | 'SCAM'
  | 'SOCIAL_ENGINEERING'
  | 'MALWARE_DELIVERY'
  | 'DATA_EXFILTRATION'
  | 'CREDENTIAL_HARVESTING'
  | 'BUSINESS_EMAIL_COMPROMISE'
  | 'IMPERSONATION'
  | 'FINANCIAL_FRAUD'
  | 'SUSPICIOUS'
  | 'UNKNOWN';

export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SecurityDecision = 'ALLOW' | 'WARN' | 'REVIEW' | 'BLOCK' | 'HUMAN_REVIEW';

export interface ScoreEngineResult {
  trustScore: number;
  riskLevel: RiskLevel;
  decision: SecurityDecision;
  primaryCategory: SecurityCategory;
  threatType: string;
}

export function calculateTrustScore(indicators: DetectedIndicator[], overrideCategory?: SecurityCategory): ScoreEngineResult {
  // If zero indicators detected, message is 100% SAFE
  if (!indicators || indicators.length === 0) {
    return {
      trustScore: 98,
      riskLevel: 'SAFE',
      decision: 'ALLOW',
      primaryCategory: overrideCategory || 'SAFE',
      threatType: 'Normal Conversation'
    };
  }

  // Calculate base impact deduction
  let totalImpact = 0;
  let hasCritical = false;
  let hasHigh = false;

  for (const ind of indicators) {
    totalImpact += ind.impact || 10;
    if (ind.severity === 'CRITICAL') hasCritical = true;
    if (ind.severity === 'HIGH') hasHigh = true;
  }

  let trustScore = Math.max(0, Math.min(100, 100 - totalImpact));

  // Determine Risk Level based on Score Guide:
  // SAFE: 90-100 | LOW: 70-89 | MEDIUM: 40-69 | HIGH: 20-39 | CRITICAL: 0-19
  let riskLevel: RiskLevel = 'SAFE';
  if (trustScore <= 19 || hasCritical) {
    riskLevel = 'CRITICAL';
    trustScore = Math.min(trustScore, 18);
  } else if (trustScore <= 39 || hasHigh) {
    riskLevel = 'HIGH';
    trustScore = Math.min(trustScore, 38);
  } else if (trustScore <= 69) {
    riskLevel = 'MEDIUM';
  } else if (trustScore <= 89) {
    riskLevel = 'LOW';
  } else {
    riskLevel = 'SAFE';
  }

  // Decision Matrix:
  // SAFE / LOW -> ALLOW | MEDIUM -> WARN | HIGH -> REVIEW | CRITICAL -> BLOCK
  let decision: SecurityDecision = 'ALLOW';
  if (riskLevel === 'CRITICAL') {
    decision = 'BLOCK';
  } else if (riskLevel === 'HIGH') {
    decision = 'REVIEW';
  } else if (riskLevel === 'MEDIUM') {
    decision = 'WARN';
  } else {
    decision = 'ALLOW';
  }

  // Determine Primary Category if not explicitly provided
  let primaryCategory: SecurityCategory = overrideCategory || 'SUSPICIOUS';
  let threatType = 'Security Telemetry Warning';

  if (!overrideCategory) {
    const types = indicators.map(i => i.type);
    if (types.includes('MALWARE_ATTACHMENT') || types.includes('EXECUTABLE_LINK')) {
      primaryCategory = 'MALWARE_DELIVERY';
      threatType = 'Malware / Executable Vector';
    } else if (types.includes('DATA_EXFILTRATION_REQUEST')) {
      primaryCategory = 'DATA_EXFILTRATION';
      threatType = 'Unauthorized Data Request';
    } else if (types.includes('CREDENTIAL_REQUEST') || types.includes('OTP_REQUEST')) {
      primaryCategory = 'CREDENTIAL_HARVESTING';
      threatType = 'Credential & OTP Theft Attempt';
    } else if (types.includes('LOTTERY_SCAM') || types.includes('CRYPTO_SCAM') || types.includes('JOB_SCAM')) {
      primaryCategory = 'SCAM';
      threatType = 'Fraudulent Financial Scam';
    } else if (types.includes('SOCIAL_ENGINEERING_PRESSURE')) {
      primaryCategory = 'SOCIAL_ENGINEERING';
      threatType = 'Social Engineering Coercion';
    } else if (types.includes('IMPERSONATION')) {
      primaryCategory = 'IMPERSONATION';
      threatType = 'Brand / Executive Impersonation';
    } else if (types.includes('FINANCIAL_REQUEST')) {
      primaryCategory = 'FINANCIAL_FRAUD';
      threatType = 'Financial Fraud / Wire Transfer';
    } else if (types.includes('SPAM_PROMOTION')) {
      primaryCategory = 'SPAM';
      threatType = 'Unwanted Promotional Content';
    } else if (types.includes('SUSPICIOUS_URL')) {
      primaryCategory = 'PHISHING';
      threatType = 'Suspicious Phishing Hyperlink';
    }
  }

  return {
    trustScore,
    riskLevel,
    decision,
    primaryCategory,
    threatType
  };
}
