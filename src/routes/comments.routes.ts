import { Router } from 'express';
import commentsController from '../controllers/commentsController';
import { authMiddleware } from '../middlewares/auth';
import {
  createCommentValidation,
  gameIdParamValidation,
  uuidParamValidation,
} from '../utils/validators';

const router = Router();

router.get('/game/:gameId', gameIdParamValidation, commentsController.getCommentsByGame);
router.post('/', authMiddleware, createCommentValidation, commentsController.createComment);
router.delete('/:id', authMiddleware, uuidParamValidation, commentsController.deleteComment);

export default router;
