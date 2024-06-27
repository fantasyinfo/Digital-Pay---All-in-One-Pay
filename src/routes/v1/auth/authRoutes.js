import express from 'express';
import { 
  registerUser, 
  loginUser, 
  verifyOTP,
  resendOTP, 
  verifyToken,
  sendPasswordResetOTP,
  resetPassword
} from '../../../controllers/auth/authController.js'

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/verify-otp', verifyOTP);
authRouter.post('/resend-otp', resendOTP);
authRouter.post('/password-reset-otp', sendPasswordResetOTP);
authRouter.post('/password-reset', resetPassword);
// Example protected route (requires valid JWT token)
authRouter.get('/protected-route', verifyToken, (req, res) => {
  res.json({ message: 'Access granted to protected route.', userId: req.userId });
});

export default authRouter;