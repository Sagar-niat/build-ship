-- TrustGuard AI Database Schema

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'USER', -- USER, SECURITY_ANALYST, ADMIN
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- PHISHING, PII_EXPOSURE, LOGIN_ANOMALY, TRANSACTION_ANOMALY, POLICY_VIOLATION, SUSPICIOUS_ACTIVITY
    severity TEXT NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    source TEXT NOT NULL,
    risk_score INT DEFAULT 0,
    status TEXT DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS threat_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    input_type TEXT DEFAULT 'MESSAGE', -- MESSAGE, EMAIL, URL, TEXT, SECURITY_EVENT
    trust_score INT NOT NULL,
    risk_level TEXT NOT NULL, -- SAFE, REVIEW, HIGH_RISK, CRITICAL
    indicators JSONB DEFAULT '[]'::jsonb,
    explanation TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pii_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    pii_types_detected TEXT[] DEFAULT '{}',
    detected_count INT DEFAULT 0,
    redacted_preview TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    anomaly_type TEXT NOT NULL,
    risk_score INT NOT NULL,
    factors JSONB DEFAULT '[]'::jsonb,
    location TEXT,
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES security_events(id) ON DELETE CASCADE,
    proposed_action TEXT NOT NULL,
    risk_score INT NOT NULL,
    system_recommendation TEXT NOT NULL,
    operator_decision TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, ESCALATED
    operator_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    resource TEXT NOT NULL,
    result TEXT NOT NULL,
    risk_level TEXT DEFAULT 'LOW',
    ip_address TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_threat_analyses_user ON threat_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
