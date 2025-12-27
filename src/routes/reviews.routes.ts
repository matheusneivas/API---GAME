import { Router } from 'express';
import reviewsController from '../controllers/reviewsController';
import { authMiddleware } from '../middlewares/auth';
import {
  createReviewValidation,
  gameIdParamValidation,
  userIdParamValidation,
  uuidParamValidation,
} from '../utils/validators';

const router = Router();

router.get('/game/:gameId', gameIdParamValidation, reviewsController.getReviewsByGame);
router.get('/user/:userId', userIdParamValidation, reviewsController.getReviewsByUser);
router.post('/', authMiddleware, createReviewValidation, reviewsController.createOrUpdateReview);
router.delete('/:id', authMiddleware, uuidParamValidation, reviewsController.deleteReview);

export default router;
