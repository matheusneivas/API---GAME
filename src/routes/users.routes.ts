import { Router } from 'express';
import usersController from '../controllers/usersController';
import { authMiddleware } from '../middlewares/auth';
import { updateProfileValidation, uuidParamValidation } from '../utils/validators';

const router = Router();

router.get('/:id', uuidParamValidation, usersController.getProfile);
router.put('/me', authMiddleware, updateProfileValidation, usersController.updateProfile);

export default router;
