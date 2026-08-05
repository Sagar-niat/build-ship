import express from 'express';
import { supabase } from '../config/supabase.js';
import { DecisionUpdateSchema } from '../schemas/validationSchemas.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

const mockDecisions = [
  {
    id: 'dec-201',
    event_id: 'evt-101',
    proposed_action: 'BLOCK_SUSPICIOUS_SENDER_AND_QUARANTINE',
    risk_score: 92,
    system_recommendation: 'REVIEW',
    operator_decision: 'PENDING',
    operator_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    security_events: {
      event_type: 'PHISHING',
      source: 'Email Security Gateway',
      details: { textSnippet: 'URGENT: Your account will be suspended today. Verify credentials immediately.' }
    }
  }
];

router.get('/', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: decisions } = await supabase
      .from('decisions')
      .select('*, security_events(*)')
      .order('created_at', { ascending: false });

    res.json({
      success: true,
      data: (decisions && decisions.length > 0) ? decisions : mockDecisions
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const validated = DecisionUpdateSchema.parse(req.body);

    const { data, error } = await supabase
      .from('decisions')
      .update({
        operator_decision: validated.operatorDecision,
        operator_notes: validated.operatorNotes || '',
        reviewed_by: req.user?.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    await supabase.from('audit_logs').insert({
      user_id: req.user?.id,
      action_type: `DECISION_${validated.operatorDecision}`,
      resource: `Decision #${id}`,
      result: validated.operatorDecision,
      risk_level: 'LOW',
      details: { operatorNotes: validated.operatorNotes }
    });

    res.json({
      success: true,
      data: data || { id, operator_decision: validated.operatorDecision, operator_notes: validated.operatorNotes }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
