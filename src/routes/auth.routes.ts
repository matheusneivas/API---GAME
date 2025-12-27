import { Router } from 'express';
import authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';
import { registerValidation, loginValidation } from '../utils/validators';

const router = Router();

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authMiddleware, authController.getMe);

export default router;
