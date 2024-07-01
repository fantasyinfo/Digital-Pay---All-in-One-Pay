// import packages
import express from 'express';
import cors from "cors";
import dotenv from "dotenv";

// i18
import i18nextMiddleware from 'i18next-http-middleware';
import i18next from './utils/i18nextTranslate.js';

// import utils
import { responseHandler } from './utils/responseHandler.js';

// import middlewares
import { errorMiddleware } from './middlewares/errorMiddleware.js';

// import routes
import authRouter from './routes/v1/auth/authRoutes.js';
import apiTokenRouter from './routes/v1/apiToken/apiTokenRoutes.js';
import { verifyToken } from './middlewares/verifyTokenMiddleware.js';
import gatewayRouter from './routes/v1/gateway/init/init.routes.js';
import { validateApiKeys } from './middlewares/validateApiKeysMiddleware.js';
import callbackRouter from './routes/v1/gateway/callback/callback.routes.js';

// init dot config
dotenv.config();

// init app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(i18nextMiddleware.handle(i18next));

// Error handling middleware
app.use(errorMiddleware);


// Routes for dashboard
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/apiToken', verifyToken, apiTokenRouter);


// gateway routes
app.use('/api/v1/gateway', validateApiKeys, gatewayRouter);

app.use('/api/v1/callback', callbackRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  responseHandler.error(res, err.message || 'Internal Server Error');
});

export default app;
