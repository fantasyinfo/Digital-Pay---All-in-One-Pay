import express from 'express';
import { registerUser, loginUser, verifyOTP,resendOTP, verifyToken} from '../../../controllers/auth/authController.js'

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/verify-otp', verifyOTP);
authRouter.post('/resend-otp', resendOTP);
// Example protected route (requires valid JWT token)
authRouter.get('/protected-route', verifyToken, (req, res) => {
  res.json({ message: 'Access granted to protected route.', userId: req.userId });
});

export default authRouter;