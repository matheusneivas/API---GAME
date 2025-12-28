import { Router } from 'express';
import listsController from '../controllers/listsController';
import { authMiddleware } from '../middlewares/auth';
import {
  createListValidation,
  updateListValidation,
  addGameToListValidation,
  removeGameFromListValidation,
  uuidParamValidation,
} from '../utils/validators';
import { createContentLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/', listsController.getPublicLists);
router.get('/my', authMiddleware, listsController.getMyLists);
router.get('/:id', uuidParamValidation, listsController.getListById);
router.post('/', authMiddleware, createContentLimiter, createListValidation, listsController.createList);
router.put('/:id', authMiddleware, updateListValidation, listsController.updateList);
router.delete('/:id', authMiddleware, uuidParamValidation, listsController.deleteList);
router.post('/:id/games', authMiddleware, createContentLimiter, addGameToListValidation, listsController.addGameToList);
router.delete('/:id/games/:gameId', authMiddleware, removeGameFromListValidation, listsController.removeGameFromList);

export default router;
