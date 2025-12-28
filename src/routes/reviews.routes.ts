import { Router } from 'express';
import reviewsController from '../controllers/reviewsController';
import { authMiddleware } from '../middlewares/auth';
import {
  createReviewValidation,
  gameIdParamValidation,
  userIdParamValidation,
  uuidParamValidation,
} from '../utils/validators';
import { createContentLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/game/:gameId', gameIdParamValidation, reviewsController.getReviewsByGame);
router.get('/user/:userId', userIdParamValidation, reviewsController.getReviewsByUser);
router.post('/', authMiddleware, createContentLimiter, createReviewValidation, reviewsController.createOrUpdateReview);
router.delete('/:id', authMiddleware, uuidParamValidation, reviewsController.deleteReview);

export default router;
