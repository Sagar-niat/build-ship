import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '../backend/src/routes/auth.js';
import analyzeRoutes from '../backend/src/routes/analyze.js';
import privacyRoutes from '../backend/src/routes/privacy.js';
import securityEventsRoutes from '../backend/src/routes/securityEvents.js';
import anomaliesRoutes from '../backend/src/routes/anomalies.js';
import decisionsRoutes from '../backend/src/routes/decisions.js';
import auditLogRoutes from '../backend/src/routes/auditLog.js';
import dashboardRoutes from '../backend/src/routes/dashboard.js';
import deviceStreamRoutes from '../backend/src/routes/deviceStream.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/gemini', analyzeRoutes);
app.use('/api/device', deviceStreamRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/security-events', securityEventsRoutes);
app.use('/api/anomalies', anomaliesRoutes);
app.use('/api/decisions', decisionsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app;
