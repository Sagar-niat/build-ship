export interface AnomalyInput {
  userId?: string;
  userEmail: string;
  loginLocation?: string;
  loginTimeHour?: number;
  deviceFingerprint?: string;
  failedAttemptsCount?: number;
}

export interface AnomalyAnalysisResult {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: Array<{ factor: string; penalty: number; description: string }>;
  recommendation: string;
}

export function evaluateAnomalies(input: AnomalyInput): AnomalyAnalysisResult {
  const factors: Array<{ factor: string; penalty: number; description: string }> = [];
  let riskScore = 0;

  // 1. Location Deviation
  if (input.loginLocation && !input.loginLocation.toLowerCase().includes('india') && !input.loginLocation.toLowerCase().includes('us')) {
    factors.push({
      factor: 'UNUSUAL_LOCATION',
      penalty: 30,
      description: `Login originated from atypical geo-location: ${input.loginLocation}`
    });
    riskScore += 30;
  }

  // 2. Off-Hours Access (e.g. 1 AM - 5 AM)
  const hour = input.loginTimeHour ?? new Date().getHours();
  if (hour >= 1 && hour <= 5) {
    factors.push({
      factor: 'UNUSUAL_TIME',
      penalty: 20,
      description: `Access requested during off-peak hours (${hour}:00 IST)`
    });
    riskScore += 20;
  }

  // 3. New Unrecognized Device
  if (input.deviceFingerprint && input.deviceFingerprint.includes('unrecognized')) {
    factors.push({
      factor: 'NEW_DEVICE',
      penalty: 25,
      description: 'Login attempted from unverified hardware fingerprint or browser context'
    });
    riskScore += 25;
  }

  // 4. Repeated Failed Logins
  if ((input.failedAttemptsCount ?? 0) >= 3) {
    const penalty = Math.min(40, (input.failedAttemptsCount || 3) * 10);
    factors.push({
      factor: 'FAILED_LOGIN_SPIKE',
      penalty,
      description: `${input.failedAttemptsCount} failed login attempts recorded in short window`
    });
    riskScore += penalty;
  }

  riskScore = Math.min(100, riskScore);

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (riskScore >= 75) riskLevel = 'CRITICAL';
  else if (riskScore >= 50) riskLevel = 'HIGH';
  else if (riskScore >= 25) riskLevel = 'MEDIUM';

  const recommendation = riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
    ? 'Require Multi-Factor Authentication (MFA) step-up and alert Security Operations.'
    : 'Session authorized under standard audit observation.';

  return {
    riskScore,
    riskLevel,
    factors,
    recommendation
  };
}
