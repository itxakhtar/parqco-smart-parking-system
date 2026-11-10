import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Behind a proxy (Render, Railway, Nginx) the real client IP comes from X-Forwarded-For; rate limits need it.
if (env.isProduction) app.set('trust proxy', 1);

// Websites allowed to call this API (set CLIENT_URL on the host; several addresses can be comma-separated).
const allowedOrigins = env.clientUrl.split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins, exposedHeaders: ['Content-Disposition'] }));
app.use(express.json({ limit: '100kb' }));
if (!env.isProduction) app.use(morgan('dev'));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;