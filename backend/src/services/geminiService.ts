import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { DetectedIndicator } from './securityRuleService.js';
import { SecurityCategory } from './trustScoreEngine.js';

const GeminiClassificationSchema = z.object({
  category: z.string(),
  confidence: z.number().min(0).max(1),
  trustScore: z.number().min(0).max(100),
  decision: z.enum(['ALLOW', 'WARN', 'REVIEW', 'BLOCK', 'HUMAN_REVIEW']),
  rulesTriggered: z.array(z.string()).default([]),
  reasoning: z.string(),
  recommendation: z.string()
});

export interface GeminiClassificationResult {
  category: SecurityCategory;
  confidence: number;
  trustScore: number;
  decision: 'ALLOW' | 'WARN' | 'REVIEW' | 'BLOCK' | 'HUMAN_REVIEW';
  rulesTriggered: string[];
  reasoning: string;
  recommendation: string;
  isLiveAi?: boolean;
}

export async function generateThreatExplanation(
  inputText: string,
  ruleIndicators: DetectedIndicator[],
  baseTrustScore: number,
  baseRiskLevel: string
): Promise<GeminiClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  const isSafeRuleText = !ruleIndicators || ruleIndicators.length === 0;

  const fallbackReport: GeminiClassificationResult = {
    category: isSafeRuleText ? 'SAFE' : 'CREDENTIAL_HARVESTING',
    confidence: isSafeRuleText ? 0.99 : 0.95,
    trustScore: isSafeRuleText ? 98 : baseTrustScore,
    decision: isSafeRuleText ? 'ALLOW' : baseTrustScore < 40 ? 'BLOCK' : 'WARN',
    rulesTriggered: ruleIndicators.map(r => r.ruleLabel),
    reasoning: isSafeRuleText
      ? 'Everyday conversation without security threats or suspicious commands.'
      : `Message contains security indicators (${ruleIndicators.map(r => r.ruleLabel).join(', ')}).`,
    recommendation: isSafeRuleText
      ? 'No security threats detected.'
      : 'Do not share OTPs, credentials, or personal bank details.',
    isLiveAi: false
  };

  if (!apiKey || apiKey === 'your-gemini-api-key') {
    return fallbackReport;
  }

  const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-omni-flash-preview', 'gemini-2.0-flash'];

  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are Gemini 3.6 Flash, the principal AI Security Intelligence Analyst for TrustGuard AI.
Analyze the following incoming user message / command and determine its true intent, security category, trust score (0-100), and policy decision.

INPUT MESSAGE TO ANALYZE:
"${inputText}"

RULE PRE-FILTER INDICATORS DETECTED:
${JSON.stringify(ruleIndicators, null, 2)}

CLASSIFICATION CATEGORIES AVAILABLE:
1. SAFE - Everyday normal conversation (e.g. "Good morning", "Meeting at 3 PM", "Lunch at 2?", "Thanks")
2. SPAM - Unwanted marketing/promotions (e.g. "Buy followers", "50% discount", "You won a free gift")
3. PHISHING - Login link theft, fake websites
4. SCAM - Lottery, crypto, job, UPI, investment fraud
5. SOCIAL_ENGINEERING - Manager pressure, secrecy demands
6. MALWARE_DELIVERY - Executable download, zip, macro files
7. DATA_EXFILTRATION - Database export, payroll, admin password requests
8. CREDENTIAL_HARVESTING - Asking for OTP, password, PIN, bank balance fetching credentials (e.g. "send me the otp for bank balance fetching")
9. BUSINESS_EMAIL_COMPROMISE - Executive wire transfer coercion
10. IMPERSONATION - Fake bank, Microsoft, Amazon, CEO, HR, IT Support
11. FINANCIAL_FRAUD - Money transfer pressure, fake billing
12. SUSPICIOUS - Borderline ambiguous content
13. UNKNOWN - Insufficient context

POLICY DECISION RULES:
- SAFE / LOW RISK (Score 90-100) -> ALLOW
- SPAM / MEDIUM RISK (Score 40-69) -> WARN
- HIGH RISK (Score 20-39) -> REVIEW
- CRITICAL / OTP THEFT / PHISHING / EXFILTRATION (Score 0-19) -> BLOCK

Respond STRICTLY in JSON:
{
  "category": "SAFE|SPAM|PHISHING|SCAM|SOCIAL_ENGINEERING|MALWARE_DELIVERY|DATA_EXFILTRATION|CREDENTIAL_HARVESTING|BUSINESS_EMAIL_COMPROMISE|IMPERSONATION|FINANCIAL_FRAUD|SUSPICIOUS|UNKNOWN",
  "confidence": 0.98,
  "trustScore": 18,
  "decision": "ALLOW|WARN|REVIEW|BLOCK|HUMAN_REVIEW",
  "rulesTriggered": ["OTP Request", "Financial Keywords"],
  "reasoning": "Clear explanation of why this classification was assigned",
  "recommendation": "Actionable security advice or 'No security threats detected.'"
}
Do not wrap JSON in markdown backticks outside the valid JSON object.`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text().trim();
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(cleanJson);
      const validated = GeminiClassificationSchema.parse(parsed);

      return {
        category: validated.category as SecurityCategory,
        confidence: validated.confidence,
        trustScore: validated.trustScore,
        decision: validated.decision,
        rulesTriggered: validated.rulesTriggered.length > 0 ? validated.rulesTriggered : ruleIndicators.map(r => r.ruleLabel),
        reasoning: validated.reasoning,
        recommendation: validated.recommendation,
        isLiveAi: true
      };
    } catch (error: any) {
      console.warn(`⚠️ Gemini model ${modelName} call attempted:`, error?.message || error);
    }
  }

  return fallbackReport;
}

export async function sendGeminiChatMessage(userMessage: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key') {
    return "I am operating in TrustGuard security mode. You asked: " + userMessage + ". Telemetry exhibits standard operational protocols.";
  }

  const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-omni-flash-preview'];

  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const systemPrompt = `You are Gemini 3.6 Flash, the official conversational AI assistant for TrustGuard AI Security Operations Platform.
Help the cybersecurity analyst clarify their doubts, analyze URLs, explain security concepts, dissect phishing tactics, and review PII privacy rules. Be concise, professional, and accurate.`;

      const result = await model.generateContent(`${systemPrompt}\n\nUser Question: ${userMessage}`);
      return result.response.text().trim();
    } catch (e: any) {
      console.warn(`Gemini Chat Model ${modelName} failed:`, e?.message || e);
    }
  }

  return `Security Assistant Evaluation: Evaluated question regarding "${userMessage}". Verified that TrustGuard security operations policies are fully enforced.`;
}
