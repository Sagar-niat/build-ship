import express from 'express';
import { ThreatAnalysisInputSchema } from '../schemas/validationSchemas.js';
import { evaluateSecurityRules } from '../services/securityRuleService.js';
import { calculateTrustScore, SecurityCategory } from '../services/trustScoreEngine.js';
import { generateThreatExplanation, sendGeminiChatMessage } from '../services/geminiService.js';
import { scanAndRedactPII } from '../services/piiService.js';
import { supabase } from '../config/supabase.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/threat', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = ThreatAnalysisInputSchema.parse(req.body);

    // Stage 1: PII Scan & Redaction
    const piiResult = scanAndRedactPII(validated.inputText);

    // Stage 2: Rule Pre-Filter
    const ruleIndicators = evaluateSecurityRules(validated.inputText);
    const baseScoreResult = calculateTrustScore(ruleIndicators);

    // Stage 3: Gemini AI Semantic Intelligence Engine
    const aiResult = await generateThreatExplanation(
      piiResult.redactedText,
      ruleIndicators,
      baseScoreResult.trustScore,
      baseScoreResult.riskLevel
    );

    // Combine Rule Indicators with Gemini Rule Triggers
    const triggeredRules = Array.from(new Set([
      ...ruleIndicators.map(r => r.ruleLabel),
      ...(aiResult.rulesTriggered || [])
    ]));

    // Determine Risk Level based on final Trust Score
    const finalTrustScore = aiResult.trustScore !== undefined ? aiResult.trustScore : baseScoreResult.trustScore;
    const finalDecision = aiResult.decision || baseScoreResult.decision;
    const finalCategory = aiResult.category || baseScoreResult.primaryCategory;

    let riskLevel = 'SAFE';
    if (finalTrustScore <= 19 || finalDecision === 'BLOCK') riskLevel = 'CRITICAL';
    else if (finalTrustScore <= 39 || finalDecision === 'REVIEW') riskLevel = 'HIGH';
    else if (finalTrustScore <= 69 || finalDecision === 'WARN') riskLevel = 'MEDIUM';
    else if (finalTrustScore <= 89) riskLevel = 'LOW';

    let recordId = `analysis-${Date.now()}`;

    try {
      const { data: record } = await supabase
        .from('threat_analyses')
        .insert({
          user_id: req.user?.id,
          input_text: piiResult.redactedText,
          input_type: validated.inputType,
          category: finalCategory,
          trust_score: finalTrustScore,
          risk_level: riskLevel,
          decision: finalDecision,
          indicators: ruleIndicators,
          explanation: aiResult.reasoning,
          recommended_action: aiResult.recommendation
        })
        .select()
        .single();
      if (record?.id) recordId = record.id;
    } catch (e) {}

    try {
      await supabase.from('audit_logs').insert({
        user_id: req.user?.id,
        action_type: 'THREAT_ANALYZED',
        resource: 'Security Analysis Center',
        result: `${finalCategory} (${finalDecision})`,
        risk_level: riskLevel,
        details: {
          category: finalCategory,
          trustScore: finalTrustScore,
          decision: finalDecision,
          isLiveAi: aiResult.isLiveAi
        }
      });
    } catch (e) {}

    res.json({
      success: true,
      data: {
        id: recordId,
        category: finalCategory,
        threatType: finalCategory === 'SAFE' ? 'Normal Conversation' : `${finalCategory.replace(/_/g, ' ')} Threat`,
        confidence: aiResult.confidence || 0.98,
        trustScore: finalTrustScore,
        riskLevel,
        decision: finalDecision,
        inputText: validated.inputText,
        redactedText: piiResult.redactedText,
        piiDetected: piiResult.piiTypesDetected,
        indicators: ruleIndicators,
        triggeredRules,
        explanation: aiResult.reasoning,
        recommendedAction: aiResult.recommendation
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/phishing', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = ThreatAnalysisInputSchema.parse(req.body);
    const ruleIndicators = evaluateSecurityRules(validated.inputText);
    const baseScoreResult = calculateTrustScore(ruleIndicators);

    const aiResult = await generateThreatExplanation(
      validated.inputText,
      ruleIndicators,
      baseScoreResult.trustScore,
      baseScoreResult.riskLevel
    );

    res.json({
      success: true,
      data: {
        category: aiResult.category,
        threatType: `${aiResult.category} Threat`,
        confidence: aiResult.confidence || 0.98,
        trustScore: aiResult.trustScore,
        riskLevel: aiResult.decision === 'BLOCK' ? 'CRITICAL' : 'SAFE',
        decision: aiResult.decision,
        indicators: ruleIndicators,
        triggeredRules: Array.from(new Set([...ruleIndicators.map(r => r.ruleLabel), ...(aiResult.rulesTriggered || [])])),
        explanation: aiResult.reasoning,
        recommendedAction: aiResult.recommendation
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/chat', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    let urlAnalysis = null;
    if (message.includes('http://') || message.includes('https://')) {
      const indicators = evaluateSecurityRules(message);
      const scoreResult = calculateTrustScore(indicators);
      urlAnalysis = {
        category: scoreResult.primaryCategory,
        trustScore: scoreResult.trustScore,
        riskLevel: scoreResult.riskLevel,
        decision: scoreResult.decision,
        indicators
      };
    }

    const reply = await sendGeminiChatMessage(message);

    res.json({
      success: true,
      reply,
      data: {
        urlAnalysis
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
