import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import authRoutes from './routes/auth.js';
import analyzeRoutes from './routes/analyze.js';
import privacyRoutes from './routes/privacy.js';
import securityEventsRoutes from './routes/securityEvents.js';
import anomaliesRoutes from './routes/anomalies.js';
import decisionsRoutes from './routes/decisions.js';
import auditLogRoutes from './routes/auditLog.js';
import dashboardRoutes from './routes/dashboard.js';
import deviceStreamRoutes from './routes/deviceStream.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'TrustGuard AI Security Operations Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Register REST API Routes
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

// Static Production SPA Delivery (Single-Service Production Deployment)
const frontendDist = path.resolve(process.cwd(), '../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'API route not found' } });
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      res.json({
        status: 'online',
        service: 'TrustGuard AI Security Platform Backend',
        version: '1.0.0'
      });
    }
  });
});

// Centralized Express Error Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ TrustGuard Backend Error:', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body or parameters',
        details: err.errors
      }
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🛡️ TrustGuard AI Production Server listening on port ${PORT}`);
});
