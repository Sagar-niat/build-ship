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

    // Stage 2: Deterministic Rule Engine
    const indicators = evaluateSecurityRules(validated.inputText);

    // Stage 3: Initial Score Calculation
    let scoreResult = calculateTrustScore(indicators);

    // Stage 4: Gemini Semantic Understanding (Only if non-obvious or to synthesize classification)
    let aiExplanation = await generateThreatExplanation(
      piiResult.redactedText,
      indicators,
      scoreResult.trustScore,
      scoreResult.riskLevel
    );

    // Stage 5: Final Policy & Category Fusion
    if (aiExplanation.category && aiExplanation.category !== 'UNKNOWN' && aiExplanation.category !== 'SUSPICIOUS') {
      scoreResult = calculateTrustScore(indicators, aiExplanation.category as SecurityCategory);
    }

    let recordId = `analysis-${Date.now()}`;

    try {
      const { data: record } = await supabase
        .from('threat_analyses')
        .insert({
          user_id: req.user?.id,
          input_text: piiResult.redactedText,
          input_type: validated.inputType,
          category: scoreResult.primaryCategory,
          trust_score: scoreResult.trustScore,
          risk_level: scoreResult.riskLevel,
          decision: scoreResult.decision,
          indicators,
          explanation: aiExplanation.reasoning,
          recommended_action: aiExplanation.recommendation
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
        result: `${scoreResult.primaryCategory} (${scoreResult.decision})`,
        risk_level: scoreResult.riskLevel,
        details: {
          category: scoreResult.primaryCategory,
          trustScore: scoreResult.trustScore,
          decision: scoreResult.decision,
          indicatorsCount: indicators.length
        }
      });
    } catch (e) {}

    const triggeredRules = indicators.map(i => i.ruleLabel);

    res.json({
      success: true,
      data: {
        id: recordId,
        category: scoreResult.primaryCategory,
        threatType: scoreResult.threatType,
        confidence: aiExplanation.confidence || 0.95,
        trustScore: scoreResult.trustScore,
        riskLevel: scoreResult.riskLevel,
        decision: scoreResult.decision,
        inputText: validated.inputText,
        redactedText: piiResult.redactedText,
        piiDetected: piiResult.piiTypesDetected,
        indicators,
        triggeredRules,
        explanation: aiExplanation.reasoning,
        recommendedAction: aiExplanation.recommendation
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/phishing', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = ThreatAnalysisInputSchema.parse(req.body);
    const indicators = evaluateSecurityRules(validated.inputText);
    const scoreResult = calculateTrustScore(indicators);
    const aiExplanation = await generateThreatExplanation(
      validated.inputText,
      indicators,
      scoreResult.trustScore,
      scoreResult.riskLevel
    );

    res.json({
      success: true,
      data: {
        category: scoreResult.primaryCategory,
        threatType: scoreResult.threatType,
        confidence: aiExplanation.confidence || 0.95,
        trustScore: scoreResult.trustScore,
        riskLevel: scoreResult.riskLevel,
        decision: scoreResult.decision,
        indicators,
        triggeredRules: indicators.map(i => i.ruleLabel),
        explanation: aiExplanation.reasoning,
        recommendedAction: aiExplanation.recommendation
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
