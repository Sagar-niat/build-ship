import express from 'express';
import { supabase } from '../config/supabase.js';
import { CreateSecurityEventSchema } from '../schemas/validationSchemas.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

const mockEvents = [
  {
    id: 'evt-101',
    event_type: 'PHISHING',
    severity: 'CRITICAL',
    source: 'Email Security Gateway',
    risk_score: 92,
    status: 'OPEN',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    details: { targetUser: 'admin@acme.corp', originIp: '185.220.101.5' }
  },
  {
    id: 'evt-102',
    event_type: 'PII_EXPOSURE',
    severity: 'HIGH',
    source: 'Slack Integration Inspector',
    risk_score: 78,
    status: 'INVESTIGATING',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    details: { piiType: 'CREDIT_CARD', channel: '#finance-ops' }
  },
  {
    id: 'evt-103',
    event_type: 'LOGIN_ANOMALY',
    severity: 'MEDIUM',
    source: 'Supabase Auth Monitor',
    risk_score: 55,
    status: 'RESOLVED',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    details: { location: 'Frankfurt, DE', normalLocation: 'Mumbai, IN' }
  }
];

router.get('/', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    let eventsList = mockEvents;
    try {
      const { data } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) eventsList = data;
    } catch (e) {}

    res.json({
      success: true,
      data: eventsList
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = CreateSecurityEventSchema.parse(req.body);
    let createdEvent = {
      id: `evt-${Date.now()}`,
      event_type: validated.eventType,
      severity: validated.severity,
      source: validated.source,
      risk_score: validated.riskScore,
      status: 'OPEN',
      created_at: new Date().toISOString()
    };

    try {
      const { data } = await supabase
        .from('security_events')
        .insert({
          user_id: req.user?.id,
          event_type: validated.eventType,
          severity: validated.severity,
          source: validated.source,
          risk_score: validated.riskScore,
          details: validated.details || {}
        })
        .select()
        .single();
      if (data) createdEvent = data;

      await supabase.from('audit_logs').insert({
        user_id: req.user?.id,
        action_type: 'SECURITY_EVENT_CREATED',
        resource: 'Security Events',
        result: validated.severity,
        risk_level: validated.severity,
        details: { eventType: validated.eventType }
      });
    } catch (e) {}

    res.status(201).json({ success: true, data: createdEvent });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    try {
      await supabase
        .from('security_events')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      await supabase.from('audit_logs').insert({
        user_id: req.user?.id,
        action_type: 'SECURITY_EVENT_RESOLVED',
        resource: `Event #${id}`,
        result: status,
        risk_level: 'LOW'
      });
    } catch (e) {}

    res.json({ success: true, data: { id, status } });
  } catch (err) {
    next(err);
  }
});

export default router;
