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

const router = Router();

router.get('/', listsController.getPublicLists);
router.get('/my', authMiddleware, listsController.getMyLists);
router.get('/:id', uuidParamValidation, listsController.getListById);
router.post('/', authMiddleware, createListValidation, listsController.createList);
router.put('/:id', authMiddleware, updateListValidation, listsController.updateList);
router.delete('/:id', authMiddleware, uuidParamValidation, listsController.deleteList);
router.post('/:id/games', authMiddleware, addGameToListValidation, listsController.addGameToList);
router.delete('/:id/games/:gameId', authMiddleware, removeGameFromListValidation, listsController.removeGameFromList);

export default router;
