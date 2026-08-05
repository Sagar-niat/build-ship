import express from 'express';
import { ThreatAnalysisInputSchema } from '../schemas/validationSchemas.js';
import { evaluateSecurityRules } from '../services/securityRuleService.js';
import { calculateTrustScore } from '../services/trustScoreEngine.js';
import { generateThreatExplanation, sendGeminiChatMessage } from '../services/geminiService.js';
import { scanAndRedactPII } from '../services/piiService.js';
import { supabase } from '../config/supabase.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/threat', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = ThreatAnalysisInputSchema.parse(req.body);

    // 1. PII Scan & Redaction
    const piiResult = scanAndRedactPII(validated.inputText);

    // 2. Security Rules Evaluation
    const indicators = evaluateSecurityRules(validated.inputText);

    // 3. Trust Score Engine
    const scoreResult = calculateTrustScore(indicators);

    // 4. Gemini AI Explanation
    const aiExplanation = await generateThreatExplanation(
      piiResult.redactedText,
      indicators,
      scoreResult.trustScore,
      scoreResult.riskLevel
    );

    let recordId = `analysis-${Date.now()}`;

    try {
      const { data: record } = await supabase
        .from('threat_analyses')
        .insert({
          user_id: req.user?.id,
          input_text: piiResult.redactedText,
          input_type: validated.inputType,
          trust_score: scoreResult.trustScore,
          risk_level: scoreResult.riskLevel,
          indicators,
          explanation: aiExplanation.explanation,
          recommended_action: aiExplanation.recommendedAction
        })
        .select()
        .single();
      if (record?.id) recordId = record.id;
    } catch (e) {
      console.warn('DB record write skipped (unseeded table):', e);
    }

    try {
      await supabase.from('audit_logs').insert({
        user_id: req.user?.id,
        action_type: 'THREAT_ANALYZED',
        resource: 'Security Analysis Center',
        result: scoreResult.riskLevel,
        risk_level: scoreResult.riskLevel,
        details: {
          trustScore: scoreResult.trustScore,
          indicatorsCount: indicators.length,
          piiDetectedCount: piiResult.detectedCount
        }
      });
    } catch (e) {}

    if (['HIGH_RISK', 'CRITICAL'].includes(scoreResult.riskLevel)) {
      try {
        const { data: secEvent } = await supabase.from('security_events').insert({
          user_id: req.user?.id,
          event_type: 'PHISHING',
          severity: scoreResult.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          source: 'Security Analysis Center',
          risk_score: 100 - scoreResult.trustScore,
          status: 'OPEN',
          details: { textSnippet: piiResult.redactedText.substring(0, 100) }
        }).select().single();

        if (secEvent) {
          await supabase.from('decisions').insert({
            event_id: secEvent.id,
            proposed_action: 'BLOCK_SENDER_AND_QUARANTINE',
            risk_score: 100 - scoreResult.trustScore,
            system_recommendation: 'REVIEW',
            operator_decision: 'PENDING'
          });
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      data: {
        id: recordId,
        inputText: validated.inputText,
        redactedText: piiResult.redactedText,
        piiDetected: piiResult.piiTypesDetected,
        trustScore: scoreResult.trustScore,
        riskLevel: scoreResult.riskLevel,
        indicators,
        explanation: aiExplanation.explanation,
        recommendedAction: aiExplanation.recommendedAction,
        aiConfidence: aiExplanation.aiConfidence
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
        classification: scoreResult.riskLevel === 'SAFE' ? 'SAFE' : scoreResult.riskLevel === 'REVIEW' ? 'SUSPICIOUS' : 'PHISHING',
        trustScore: scoreResult.trustScore,
        riskLevel: scoreResult.riskLevel,
        indicators,
        explanation: aiExplanation.explanation,
        recommendedAction: aiExplanation.recommendedAction
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

    // Check if input contains URL
    let urlAnalysis = null;
    if (message.includes('http://') || message.includes('https://')) {
      const indicators = evaluateSecurityRules(message);
      const scoreResult = calculateTrustScore(indicators);
      urlAnalysis = {
        trustScore: scoreResult.trustScore,
        riskLevel: scoreResult.riskLevel,
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
