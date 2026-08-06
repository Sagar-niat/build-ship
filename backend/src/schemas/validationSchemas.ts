import { z } from 'zod';

export const ThreatAnalysisInputSchema = z.object({
  inputText: z.string().min(1, 'Input text must be at least 1 character long'),
  inputType: z.enum(['MESSAGE', 'EMAIL', 'URL', 'TEXT', 'SECURITY_EVENT']).default('MESSAGE')
});

export const PrivacyScanSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  enableAiScan: z.boolean().default(false)
});

export const CreateSecurityEventSchema = z.object({
  eventType: z.enum(['PHISHING', 'PII_EXPOSURE', 'LOGIN_ANOMALY', 'TRANSACTION_ANOMALY', 'POLICY_VIOLATION', 'SUSPICIOUS_ACTIVITY']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  source: z.string().min(2),
  riskScore: z.number().min(0).max(100),
  details: z.record(z.any()).optional()
});

export const DecisionUpdateSchema = z.object({
  operatorDecision: z.enum(['APPROVED', 'REJECTED', 'ESCALATED']),
  operatorNotes: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(['USER', 'SECURITY_ANALYST', 'ADMIN']).default('USER')
});
