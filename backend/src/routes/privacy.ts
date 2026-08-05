import express from 'express';
import { PrivacyScanSchema } from '../schemas/validationSchemas.js';
import { scanAndRedactPII } from '../services/piiService.js';
import { supabase } from '../config/supabase.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/scan', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = PrivacyScanSchema.parse(req.body);
    const result = scanAndRedactPII(validated.text);

    try {
      await supabase.from('pii_scans').insert({
        user_id: req.user?.id,
        pii_types_detected: result.piiTypesDetected,
        detected_count: result.detectedCount,
        redacted_preview: result.redactedText.substring(0, 200)
      });

      await supabase.from('audit_logs').insert({
        user_id: req.user?.id,
        action_type: 'PII_DETECTED',
        resource: 'PII Privacy Center',
        result: `${result.detectedCount} PII elements detected`,
        risk_level: result.detectedCount > 0 ? 'MEDIUM' : 'LOW',
        details: { piiTypes: result.piiTypesDetected }
      });
    } catch (e) {}

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

router.post('/redact', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = PrivacyScanSchema.parse(req.body);
    const result = scanAndRedactPII(validated.text);

    try {
      await supabase.from('audit_logs').insert({
        user_id: req.user?.id,
        action_type: 'PII_REDACTED',
        resource: 'PII Privacy Center',
        result: 'Redacted content generated',
        risk_level: 'LOW',
        details: { redactedTypesCount: result.piiTypesDetected.length }
      });
    } catch (e) {}

    res.json({
      success: true,
      data: {
        redactedText: result.redactedText,
        detectedCount: result.detectedCount,
        piiTypesDetected: result.piiTypesDetected
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
