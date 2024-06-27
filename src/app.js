import express from 'express';
import exampleRoutes from './routes/v1/exampleRoutes.js';
import { responseHandler } from './utils/responseHandler.js';
import cors from "cors";
import dotenv from "dotenv";
import { errorMiddleware } from './middlewares/errorMiddleware.js';
dotenv.config();
const app = express();

// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Error handling middleware
app.use(errorMiddleware);


// Routes
app.use('/api/v1/examples', exampleRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
  responseHandler.error(res, err.message || 'Internal Server Error');
});

export default app;
