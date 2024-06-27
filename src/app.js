// import packages
import express from 'express';
import cors from "cors";
import dotenv from "dotenv";

// import utils
import { responseHandler } from './utils/responseHandler.js';

// import middlewares
import { errorMiddleware } from './middlewares/errorMiddleware.js';

// import routes
import authRouter from './routes/v1/auth/authRoutes.js';

// init dot config
dotenv.config();

// init app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Error handling middleware
app.use(errorMiddleware);


// Routes
app.use('/api/v1/auth', authRouter);



// Error handling middleware
app.use((err, req, res, next) => {
  responseHandler.error(res, err.message || 'Internal Server Error');
});

export default app;
