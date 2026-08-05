export interface DetectedIndicator {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence: string;
  impact: number;
  explanation: string;
  recommendedAction: string;
}

export function evaluateSecurityRules(text: string): DetectedIndicator[] {
  const indicators: DetectedIndicator[] = [];

  // 1. Urgency Manipulation
  const urgencyPattern = /(urgent|immediately|action required|suspended|suspended today|within 24 hours|account closed|expire|right now|now|send an otp|tell to)/i;
  if (urgencyPattern.test(text)) {
    indicators.push({
      type: 'URGENT_LANGUAGE',
      severity: 'HIGH',
      evidence: text.match(urgencyPattern)?.[0] || 'Urgent timeframe demand',
      impact: 20,
      explanation: 'The message attempts to pressure the recipient into acting immediately without verifying details.',
      recommendedAction: 'Do not act under artificial time pressure. Verify independently through official channels.'
    });
  }

  // 2. Credential & OTP Harvesting Request
  const credentialPattern = /(provide your credentials|confirm your|verify your (identity|account|credentials|password|login)|confirm your (identity|account|credentials|password|login|bank account statement|bank account)|click here to (login|verify|reset)|enter your (password|pin|otp)|send your (6-digit|6 digit|otp|pin)|send an otp|tell to|tell the otp|share otp)/i;
  if (credentialPattern.test(text)) {
    indicators.push({
      type: 'CREDENTIAL_REQUEST',
      severity: 'CRITICAL',
      evidence: text.match(credentialPattern)?.[0] || 'Credential request detected',
      impact: 35,
      explanation: 'Direct or indirect attempt to collect sensitive login credentials, bank authorization codes, or OTP access tokens.',
      recommendedAction: 'Never disclose passwords, bank credentials, or OTP codes over chat, SMS, or unverified forms.'
    });
  }

  // 3. Suspicious Links / Domains
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlPattern);
  if (urls && urls.length > 0) {
    const suspiciousSubdomain = /(bit\.ly|tinyurl|http:\/\/[0-9]+\.|login-|account-|verify-|ship-track)/i;
    const isSuspicious = urls.some(u => suspiciousSubdomain.test(u) || u.startsWith('http://'));
    indicators.push({
      type: 'SUSPICIOUS_URL',
      severity: isSuspicious ? 'CRITICAL' : 'MEDIUM',
      evidence: urls.join(', '),
      impact: isSuspicious ? 30 : 15,
      explanation: isSuspicious 
        ? 'Embedded link uses an unencrypted or spoofed domain commonly associated with phishing landing pages.'
        : 'Embedded external hyperlink present in incoming message.',
      recommendedAction: 'Hover over links to inspect actual target URL. Do not visit suspicious domains.'
    });
  }

  // 4. Impersonation Language
  const impersonationPattern = /(security team|customer support|it administrator|bank customer care|official notification|bank statements|bank account statement)/i;
  if (impersonationPattern.test(text)) {
    indicators.push({
      type: 'IMPERSONATION',
      severity: 'HIGH',
      evidence: text.match(impersonationPattern)?.[0] || 'Brand/Role impersonation',
      impact: 15,
      explanation: 'Language designed to impersonate trusted banking or corporate authority figures.',
      recommendedAction: 'Contact official support directly via verified company directory.'
    });
  }

  // 5. Financial / Payment Pressure
  const financialPattern = /(bank statement|bank statements|bank account|bank accounts|refund|payment|billing|credit card|invoice|transaction)/i;
  if (financialPattern.test(text)) {
    indicators.push({
      type: 'FINANCIAL_REQUEST',
      severity: 'MEDIUM',
      evidence: text.match(financialPattern)?.[0] || 'Payment terminology',
      impact: 15,
      explanation: 'Contains financial or payment terms seeking monetary transaction or bank account verification.',
      recommendedAction: 'Confirm billing transactions only through official enterprise accounting portal.'
    });
  }

  return indicators;
}
