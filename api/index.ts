import express from 'express';
import cors from 'cors';
import { httpLogger } from './middlewares/logger';
import authRouter from './routes/auth';
import recipientsRouter from './routes/recipients';
import animalsRouter from './routes/animals';
import { globalRateLimiter } from './middlewares/rateLimit';

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(httpLogger);

app.use('/api', globalRateLimiter);

// Global Types for Express Request
import { UserPayload } from './middlewares/auth';
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Routes
app.use('/api', authRouter);
app.use('/api/recipients', recipientsRouter);
app.use('/api/animals', animalsRouter);

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Backend API running on http://localhost:${port}`);
  });
}

export default app;
