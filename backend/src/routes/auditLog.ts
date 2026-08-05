import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

const mockLogs = [
  {
    id: 'log-301',
    user_id: '00000000-0000-0000-0000-000000000001',
    action_type: 'THREAT_ANALYZED',
    resource: 'Security Analysis Center',
    result: 'CRITICAL',
    risk_level: 'CRITICAL',
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    details: { trustScore: 18, indicatorsCount: 4, piiDetectedCount: 2 }
  },
  {
    id: 'log-302',
    user_id: '00000000-0000-0000-0000-000000000001',
    action_type: 'PII_REDACTED',
    resource: 'PII Privacy Center',
    result: 'Redacted content generated',
    risk_level: 'LOW',
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    details: { redactedTypesCount: 3 }
  },
  {
    id: 'log-303',
    user_id: '00000000-0000-0000-0000-000000000001',
    action_type: 'DECISION_APPROVED',
    resource: 'Decision #dec-201',
    result: 'APPROVED',
    risk_level: 'LOW',
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    details: { operatorNotes: 'Confirmed malicious domain in email body.' }
  }
];

router.get('/', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    res.json({
      success: true,
      data: (logs && logs.length > 0) ? logs : mockLogs
    });
  } catch (err) {
    next(err);
  }
});

export default router;
