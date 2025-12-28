import { Router } from 'express';
import authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';
import { registerValidation, loginValidation } from '../utils/validators';
import { registerLimiter, loginLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register', registerLimiter, registerValidation, authController.register);
router.post('/login', loginLimiter, loginValidation, authController.login);
router.get('/me', authMiddleware, authController.getMe);

export default router;
