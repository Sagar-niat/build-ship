import express from 'express';
import { evaluateAnomalies } from '../services/anomalyService.js';
import { supabase } from '../config/supabase.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

const mockAnomalies = [
  {
    id: 'anom-1',
    user_email: 'admin@acme.corp',
    anomaly_type: 'AUTHENTICATION_ANOMALY',
    risk_score: 75,
    factors: [
      { factor: 'UNUSUAL_LOCATION', penalty: 30, description: 'Login originated from atypical geo-location: Moscow, RU' },
      { factor: 'UNUSUAL_TIME', penalty: 20, description: 'Access requested during off-peak hours (03:14 IST)' },
      { factor: 'NEW_DEVICE', penalty: 25, description: 'Login attempted from unverified hardware fingerprint' }
    ],
    location: 'Moscow, RU',
    device_info: 'Chrome on Linux (Unrecognized)',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  }
];

router.get('/', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: anomalies } = await supabase
      .from('anomalies')
      .select('*')
      .order('created_at', { ascending: false });

    res.json({
      success: true,
      data: (anomalies && anomalies.length > 0) ? anomalies : mockAnomalies
    });
  } catch (err) {
    next(err);
  }
});

router.post('/analyze', authenticateUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userEmail, loginLocation, loginTimeHour, deviceFingerprint, failedAttemptsCount } = req.body;
    const result = evaluateAnomalies({
      userId: req.user?.id,
      userEmail: userEmail || req.user?.email || 'operator@trustguard.ai',
      loginLocation,
      loginTimeHour,
      deviceFingerprint,
      failedAttemptsCount
    });

    await supabase.from('anomalies').insert({
      user_id: req.user?.id,
      anomaly_type: 'AUTHENTICATION_ANOMALY',
      risk_score: result.riskScore,
      factors: result.factors,
      location: loginLocation || 'Unknown',
      device_info: deviceFingerprint || 'Unknown Browser'
    });

    await supabase.from('audit_logs').insert({
      user_id: req.user?.id,
      action_type: 'ANOMALY_EVALUATED',
      resource: 'Anomaly Engine',
      result: result.riskLevel,
      risk_level: result.riskLevel,
      details: { riskScore: result.riskScore }
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
