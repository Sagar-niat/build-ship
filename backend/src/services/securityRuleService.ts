export interface DetectedIndicator {
  type: string;
  ruleLabel: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence: string;
  impact: number;
  explanation: string;
  recommendedAction: string;
}

export function evaluateSecurityRules(text: string): DetectedIndicator[] {
  const indicators: DetectedIndicator[] = [];

  // 1. Safe Conversation Fast-Filter (Normal greetings & non-malicious chat)
  const safeConversationPattern = /^(good morning|good afternoon|good evening|hello|hi|hey|yo|meeting moved to|please review the attached report|happy birthday|lunch at|can you send yesterday|thanks|thank you|see you|ok|sure|got it|sounds good)(\.|\!|\?)?$/i;
  if (safeConversationPattern.test(text.trim())) {
    return []; // Instantly return zero indicators -> SAFE
  }

  // 2. Data Exfiltration / Sensitive Data Request (Always Critical)
  const dataExfiltrationPattern = /(send customer database|export all employee records|upload payroll|send admin passwords|send database|export database|share customer data|export user records)/i;
  if (dataExfiltrationPattern.test(text)) {
    indicators.push({
      type: 'DATA_EXFILTRATION_REQUEST',
      ruleLabel: 'Data Exfiltration Request',
      severity: 'CRITICAL',
      evidence: text.match(dataExfiltrationPattern)?.[0] || 'Sensitive Data Solicitation',
      impact: 50,
      explanation: 'Direct attempt to exfiltrate confidential customer databases, payroll files, or administrator credentials.',
      recommendedAction: 'STRICT BLOCK: Do not export or transmit sensitive databases or credentials. Escalate immediately to Security.'
    });
  }

  // 3. Malware & Dangerous Attachment Delivery (Always Critical)
  const malwarePattern = /(\.exe|\.bat|\.vbs|\.ps1|\.zip|\.scr|\.dmg|download executable|install app|macro document|download patch)/i;
  if (malwarePattern.test(text)) {
    indicators.push({
      type: 'MALWARE_ATTACHMENT',
      ruleLabel: 'Malware / Executable File',
      severity: 'CRITICAL',
      evidence: text.match(malwarePattern)?.[0] || 'Executable extension/download',
      impact: 45,
      explanation: 'Contains links or references to executable code, compressed archives, or unverified software installers.',
      recommendedAction: 'STRICT BLOCK: Do not download or execute unverified attachments or installer scripts.'
    });
  }

  // 4. OTP & Password Requests (Critical)
  const otpPattern = /(send (me|an|the) (otp|pin|code)|tell (me|the) otp|share otp|otp for|bank balance|balance fetching|fetching balance|enter your (otp|pin|passcode)|what is your (otp|pin)|provide your (otp|pin|passcode))/i;
  if (otpPattern.test(text)) {
    indicators.push({
      type: 'OTP_REQUEST',
      ruleLabel: 'OTP Request',
      severity: 'CRITICAL',
      evidence: text.match(otpPattern)?.[0] || 'OTP solicitation',
      impact: 40,
      explanation: 'Solicits One-Time Passwords (OTPs) or 2FA security codes under the guise of bank balance fetching or account access.',
      recommendedAction: 'STRICT BLOCK: Never disclose OTP authorization codes to anyone under any circumstances.'
    });
  }

  // 5. Credential Harvesting Requests (Critical)
  const credentialPattern = /(provide your credentials|verify your (identity|account|credentials|password|login)|confirm your (identity|account|credentials|password|login|bank account statement)|click here to (login|verify|reset)|enter your password|update your payment|login to verify)/i;
  if (credentialPattern.test(text)) {
    indicators.push({
      type: 'CREDENTIAL_REQUEST',
      ruleLabel: 'Credential Request',
      severity: 'CRITICAL',
      evidence: text.match(credentialPattern)?.[0] || 'Credential solicitation',
      impact: 35,
      explanation: 'Direct or indirect attempt to collect sensitive login credentials or access tokens.',
      recommendedAction: 'Never enter credentials on links provided via unverified messages or emails.'
    });
  }

  // 6. Lottery, Crypto, Job & Financial Scams (Critical)
  const scamPattern = /(lottery|you won|free iphone|earn ₹|earn \$|daily income|crypto investment|guaranteed returns|no risk investment|pre-approved loan|upi cashback|government benefit|free gifts)/i;
  if (scamPattern.test(text)) {
    indicators.push({
      type: 'LOTTERY_SCAM',
      ruleLabel: 'Fraudulent Scam Pattern',
      severity: 'CRITICAL',
      evidence: text.match(scamPattern)?.[0] || 'Fraudulent reward / investment claim',
      impact: 30,
      explanation: 'Exhibits characteristics of advance-fee fraud, fake lottery winnings, or high-yield investment scams.',
      recommendedAction: 'Ignore fraudulent prize claims and do not send money or banking details.'
    });
  }

  // 7. Impersonation & Social Engineering (High/Critical)
  const impersonationPattern = /(i'm your manager|this is confidential|don't tell anyone|fake bank|microsoft support|it support|hr department|ceo|customer care|official notification)/i;
  if (impersonationPattern.test(text)) {
    indicators.push({
      type: 'IMPERSONATION',
      ruleLabel: 'Impersonation Words',
      severity: 'HIGH',
      evidence: text.match(impersonationPattern)?.[0] || 'Executive / Authority impersonation',
      impact: 20,
      explanation: 'Uses authority figure impersonation or secrecy demands to manipulate recipient compliance.',
      recommendedAction: 'Verify sender identity independently through official out-of-band communication channels.'
    });
  }

  // 8. Urgency Manipulation (High)
  const urgencyPattern = /(urgent|immediately|action required|suspended|suspended today|within 24 hours|account closed|expire|right now|act now)/i;
  if (urgencyPattern.test(text)) {
    indicators.push({
      type: 'URGENT_LANGUAGE',
      ruleLabel: 'Urgency Language',
      severity: 'HIGH',
      evidence: text.match(urgencyPattern)?.[0] || 'Urgent pressure phrasing',
      impact: 15,
      explanation: 'Applies psychological pressure through coercive urgency to force hasty decisions.',
      recommendedAction: 'Do not act under artificial time pressure. Verify independently.'
    });
  }

  // 9. Suspicious URLs & Shorteners (High/Critical)
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlPattern);
  if (urls && urls.length > 0) {
    const suspiciousSubdomain = /(bit\.ly|tinyurl|http:\/\/[0-9]+\.|login-|account-|verify-|ship-track)/i;
    const isSuspicious = urls.some(u => suspiciousSubdomain.test(u) || u.startsWith('http://'));
    indicators.push({
      type: 'SUSPICIOUS_URL',
      ruleLabel: 'Suspicious Domain',
      severity: isSuspicious ? 'CRITICAL' : 'MEDIUM',
      evidence: urls.join(', '),
      impact: isSuspicious ? 25 : 10,
      explanation: isSuspicious 
        ? 'Embedded link uses an unencrypted or spoofed domain commonly associated with phishing landing pages.'
        : 'Embedded external hyperlink present in incoming message.',
      recommendedAction: 'Hover over links to inspect actual target URL. Do not visit suspicious domains.'
    });
  }

  // 10. Unwanted Spam & Promotional Offer Keywords (Medium)
  const spamPattern = /(buy followers|50% discount|click here for free|limited offer|special offer|discount code|marketing promotion|subscribe now)/i;
  if (spamPattern.test(text)) {
    indicators.push({
      type: 'SPAM_PROMOTION',
      ruleLabel: 'Spam / Promotional Offer',
      severity: 'MEDIUM',
      evidence: text.match(spamPattern)?.[0] || 'Unsolicited promotional phrasing',
      impact: 15,
      explanation: 'Contains unsolicited commercial advertising or promotional marketing content.',
      recommendedAction: 'Unsubscribe or filter promotional sender to reduce unwanted inbox noise.'
    });
  }

  // 11. Financial / Wire Transfer Keywords (Medium/High)
  const financialPattern = /(wire transfer|bank statement|bank account|bank balance|refund|invoice payment|credit card details|billing update)/i;
  if (financialPattern.test(text)) {
    indicators.push({
      type: 'FINANCIAL_REQUEST',
      ruleLabel: 'Financial Keywords',
      severity: 'MEDIUM',
      evidence: text.match(financialPattern)?.[0] || 'Financial payment terms',
      impact: 15,
      explanation: 'Contains financial terminology involving money transfers or billing account updates.',
      recommendedAction: 'Confirm financial requests only through verified enterprise accounting processes.'
    });
  }

  return indicators;
}
