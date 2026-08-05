import express from 'express';
import { scanAndRedactPII } from '../services/piiService.js';
import { evaluateSecurityRules } from '../services/securityRuleService.js';
import { calculateTrustScore } from '../services/trustScoreEngine.js';
import { generateThreatExplanation } from '../services/geminiService.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Mock device feed queue
const simulatedDeviceFeed = [
  {
    id: 'msg-dev-001',
    sender: '+1 (800) 555-0199',
    senderName: 'Unknown Sender',
    rawText: 'URGENT: Your account credentials have expired. Verify your account immediately at http://login-verify-pass.com',
    receivedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    channel: 'SMS',
    trustScore: 30,
    riskLevel: 'CRITICAL',
    status: 'AUTO_BLOCKED',
    explanation: 'Automatically blocked by TrustGuard AI due to high-risk phishing links and urgency demands.'
  },
  {
    id: 'msg-dev-002',
    sender: 'support@acme-corp.com',
    senderName: 'Acme IT Desk',
    rawText: 'Hello team, reminder to update your quarterly security training by Friday.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    channel: 'EMAIL',
    trustScore: 95,
    riskLevel: 'SAFE',
    status: 'VERIFIED_SAFE',
    explanation: 'Internal security communication verified as safe.'
  },
  {
    id: 'msg-dev-003',
    sender: '+91 9876543210',
    senderName: 'Bank Alert',
    rawText: 'there is an urgent confirmation of your bank statements so can you please provide your credentials that we can see that, after we send an otp so you can tell right now',
    receivedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    channel: 'SMS',
    trustScore: 33,
    riskLevel: 'CRITICAL',
    status: 'AUTO_BLOCKED',
    explanation: 'Automatically blocked by TrustGuard AI due to bank statement impersonation and OTP harvesting.'
  }
];

let deviceStore = [...simulatedDeviceFeed];

router.get('/messages', async (req, res) => {
  res.json({ success: true, data: deviceStore });
});

router.get('/quarantine', async (req, res) => {
  const quarantined = deviceStore.filter(m => (m as any).status === 'AUTO_BLOCKED');
  res.json({ success: true, data: quarantined });
});

router.post('/incoming', async (req, res, next) => {
  try {
    const { sender, senderName, rawText, channel } = req.body;
    if (!rawText) {
      return res.status(400).json({ success: false, error: 'rawText is required' });
    }

    // 1. PII Scan
    const piiResult = scanAndRedactPII(rawText);

    // 2. Evaluate Security Rules
    const indicators = evaluateSecurityRules(rawText);

    // 3. Trust Score Engine
    const scoreResult = calculateTrustScore(indicators);

    // 4. Gemini 3.6 Flash AI Explanation
    const aiExplanation = await generateThreatExplanation(
      piiResult.redactedText,
      indicators,
      scoreResult.trustScore,
      scoreResult.riskLevel
    );

    // 5. Strict Auto-Block Logic: Any detected risk indicator triggers Auto-Block
    const isAutoBlocked = indicators.length > 0 || ['CRITICAL', 'HIGH_RISK', 'REVIEW'].includes(scoreResult.riskLevel) || scoreResult.trustScore < 85;
    const status = isAutoBlocked ? 'AUTO_BLOCKED' : 'VERIFIED_SAFE';

    const processedMsg = {
      id: `dev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: sender || 'Incoming Contact',
      senderName: senderName || 'Device Notification',
      rawText,
      redactedText: piiResult.redactedText,
      channel: channel || 'SMS',
      receivedAt: new Date().toISOString(),
      trustScore: scoreResult.trustScore,
      riskLevel: isAutoBlocked && scoreResult.riskLevel === 'SAFE' ? 'HIGH_RISK' : scoreResult.riskLevel,
      indicators,
      explanation: aiExplanation.explanation,
      recommendedAction: aiExplanation.recommendedAction,
      status,
      aiConfidence: aiExplanation.aiConfidence
    };

    deviceStore.unshift(processedMsg);

    // 6. Save to Supabase (safely handled)
    try {
      await supabase.from('security_events').insert({
        event_type: isAutoBlocked ? 'AUTO_BLOCKED_SPAM' : 'VERIFIED_MESSAGE',
        severity: isAutoBlocked ? 'HIGH' : 'LOW',
        source: `Device Guard (${channel || 'SMS'})`,
        risk_score: 100 - scoreResult.trustScore,
        status: isAutoBlocked ? 'QUARANTINED' : 'CLEARED',
        details: processedMsg
      });

      await supabase.from('audit_logs').insert({
        action_type: isAutoBlocked ? 'AUTO_BLOCKED_BY_TRUSTGUARD_AI' : 'VERIFIED_SAFE_BY_TRUSTGUARD',
        resource: `Sender: ${sender || 'Device'}`,
        result: status,
        risk_level: scoreResult.riskLevel,
        details: { trustScore: scoreResult.trustScore, indicatorsCount: indicators.length }
      });
    } catch (e) {}

    res.json({
      success: true,
      data: processedMsg
    });
  } catch (err) {
    next(err);
  }
});

router.post('/unblock/:id', (req, res) => {
  const { id } = req.params;
  const item = deviceStore.find(m => m.id === id);
  if (item) {
    (item as any).status = 'MANUALLY_ALLOWED';
  }
  res.json({ success: true, data: item });
});

export default router;
