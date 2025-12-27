import { Router } from 'express';
import gamesController from '../controllers/gamesController';
import { searchQueryValidation, gameIdParamValidation } from '../utils/validators';

const router = Router();

router.get('/search', searchQueryValidation, gamesController.searchGames);
router.get('/trending', gamesController.getTrendingGames);
router.get('/recent', gamesController.getRecentGames);
router.get('/:id', gameIdParamValidation, gamesController.getGameDetails);

export default router;
