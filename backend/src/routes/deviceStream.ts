import express from 'express';
import { scanAndRedactPII } from '../services/piiService.js';
import { evaluateSecurityRules } from '../services/securityRuleService.js';
import { calculateTrustScore, SecurityCategory } from '../services/trustScoreEngine.js';
import { generateThreatExplanation } from '../services/geminiService.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

const simulatedDeviceFeed = [
  {
    id: 'msg-dev-001',
    sender: '+1 (800) 555-0199',
    senderName: 'Unknown Sender',
    rawText: 'URGENT: Your account credentials have expired. Verify your account immediately at http://login-verify-pass.com',
    receivedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    channel: 'SMS',
    category: 'CREDENTIAL_HARVESTING',
    trustScore: 15,
    riskLevel: 'CRITICAL',
    decision: 'BLOCK',
    status: 'AUTO_BLOCKED',
    triggeredRules: ['Urgency Language', 'Credential Request', 'Suspicious Domain'],
    explanation: 'Automatically blocked by TrustGuard AI due to high-risk phishing links and urgency demands.'
  },
  {
    id: 'msg-dev-002',
    sender: 'support@acme-corp.com',
    senderName: 'Acme IT Desk',
    rawText: 'Good morning team. Meeting moved to 3 PM. Please review the attached report.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    channel: 'EMAIL',
    category: 'SAFE',
    trustScore: 98,
    riskLevel: 'SAFE',
    decision: 'ALLOW',
    status: 'VERIFIED_SAFE',
    triggeredRules: [],
    explanation: 'No security threats detected.'
  },
  {
    id: 'msg-dev-003',
    sender: '+91 9876543210',
    senderName: 'Bank Alert',
    rawText: 'there is an urgent confirmation of your bank statements so can you please provide your credentials that we can see that, after we send an otp so you can tell right now',
    receivedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    channel: 'SMS',
    category: 'CREDENTIAL_HARVESTING',
    trustScore: 18,
    riskLevel: 'CRITICAL',
    decision: 'BLOCK',
    status: 'AUTO_BLOCKED',
    triggeredRules: ['Urgency Language', 'Credential Request', 'OTP Request', 'Impersonation Words'],
    explanation: 'Automatically blocked by TrustGuard AI due to bank statement impersonation and OTP harvesting.'
  }
];

let deviceStore = [...simulatedDeviceFeed];

router.get('/messages', async (req, res) => {
  res.json({ success: true, data: deviceStore });
});

router.get('/quarantine', async (req, res) => {
  const quarantined = deviceStore.filter(m => (m as any).status === 'AUTO_BLOCKED' || (m as any).decision === 'BLOCK');
  res.json({ success: true, data: quarantined });
});

router.post('/incoming', async (req, res, next) => {
  try {
    const { sender, senderName, rawText, channel } = req.body;
    if (!rawText) {
      return res.status(400).json({ success: false, error: 'rawText is required' });
    }

    const piiResult = scanAndRedactPII(rawText);
    const indicators = evaluateSecurityRules(rawText);
    let scoreResult = calculateTrustScore(indicators);

    const aiExplanation = await generateThreatExplanation(
      piiResult.redactedText,
      indicators,
      scoreResult.trustScore,
      scoreResult.riskLevel
    );

    if (aiExplanation.category && aiExplanation.category !== 'UNKNOWN' && aiExplanation.category !== 'SUSPICIOUS') {
      scoreResult = calculateTrustScore(indicators, aiExplanation.category as SecurityCategory);
    }

    const isAutoBlocked = scoreResult.decision === 'BLOCK' || scoreResult.riskLevel === 'CRITICAL' || scoreResult.trustScore < 40;
    const status = isAutoBlocked ? 'AUTO_BLOCKED' : 'VERIFIED_SAFE';

    const processedMsg = {
      id: `dev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: sender || 'Incoming Contact',
      senderName: senderName || 'Device Notification',
      rawText,
      redactedText: piiResult.redactedText,
      channel: channel || 'SMS',
      receivedAt: new Date().toISOString(),
      category: scoreResult.primaryCategory,
      threatType: scoreResult.threatType,
      trustScore: scoreResult.trustScore,
      riskLevel: scoreResult.riskLevel,
      decision: scoreResult.decision,
      indicators,
      triggeredRules: indicators.map(i => i.ruleLabel),
      explanation: aiExplanation.reasoning,
      recommendedAction: aiExplanation.recommendation,
      status,
      aiConfidence: aiExplanation.confidence || 0.95
    };

    deviceStore.unshift(processedMsg);

    try {
      await supabase.from('security_events').insert({
        event_type: isAutoBlocked ? 'AUTO_BLOCKED_SPAM' : 'VERIFIED_MESSAGE',
        severity: scoreResult.riskLevel,
        source: `Device Guard (${channel || 'SMS'})`,
        risk_score: 100 - scoreResult.trustScore,
        status: isAutoBlocked ? 'QUARANTINED' : 'CLEARED',
        details: processedMsg
      });

      await supabase.from('audit_logs').insert({
        action_type: isAutoBlocked ? 'AUTO_BLOCKED_BY_TRUSTGUARD_AI' : 'VERIFIED_SAFE_BY_TRUSTGUARD',
        resource: `Sender: ${sender || 'Device'}`,
        result: `${scoreResult.primaryCategory} (${scoreResult.decision})`,
        risk_level: scoreResult.riskLevel,
        details: { trustScore: scoreResult.trustScore, category: scoreResult.primaryCategory }
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
    (item as any).decision = 'ALLOW';
  }
  res.json({ success: true, data: item });
});

export default router;
