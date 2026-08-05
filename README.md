# TrustGuard AI — AI Security, Privacy & Trust Operations Platform

> **Hackathon Submission**: Theme — *"AI Security, Governance & Trust"*

TrustGuard AI is an enterprise-grade cybersecurity operations platform demonstrating threat analysis, PII detection & auto-redaction, phishing vector detection, deterministic trust scoring, authentication anomaly detection, and human approval gates for high-risk security actions.

---

## 🌟 Key Product Architecture & Highlights

1. **Detect → Explain → Protect → Verify → Audit**: Complete end-to-end security governance loop.
2. **AI Intelligence + Deterministic Rule Engine**:
   - Deterministic backend security rules evaluate risk scores, impact penalties, and clamp bounds (0-100).
   - Gemini 2.0 Flash (`@google/generative-ai`) provides explainable reasoning reports without dictating final security decisions.
3. **PII Detection & Auto-Redaction Pipeline**:
   - Detects Emails, Phone Numbers, Aadhaar, PAN, Credit Cards, and IP Addresses.
   - Automatically redacts sensitive content before sending to external APIs or DB storage.
4. **Human Operator Governance Gates**: High-risk actions (`BLOCK_SENDER_AND_QUARANTINE`) trigger a pending decision state requiring operator confirmation.
5. **Immutable Security Audit Trail**: Complete transparent audit log capturing timestamps, actions, risk scores, and telemetry payloads.

---

## 🏗️ System Architecture

```
                    +---------------------------------------+
                    |           React.js + TS Frontend      |
                    |  (Tailwind CSS, Recharts, Lucide)     |
                    +-------------------+-------------------+
                                        | REST API (JWT)
                                        v
                    +-------------------+-------------------+
                    |         Node.js Express Backend       |
                    | (Helmet, CORS, Zod Validation)       |
                    +---------+-------------------+---------+
                              |                   |
                    Rule      |                   | SQL Queries
                    Evaluation|                   | (Service Role)
                              v                   v
                    +---------+---------+   +-----+-----------------+
                    | Google Gemini API |   | Supabase PostgreSQL   |
                    | (gemini-2.0-flash)|   |  (7 Tables + RLS)     |
                    +-------------------+   +-----------------------+
```

---

## 🚀 Local Setup & Installation

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2. Frontend Setup

In a new terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Demo Analyst Credentials

- **Email**: `demo@trustguard.ai`
- **Password**: `password123`
