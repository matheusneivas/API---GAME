import { Router } from 'express';
import gamesController from '../controllers/gamesController';
import { searchQueryValidation, gameIdParamValidation } from '../utils/validators';
import { searchLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Busca
router.get('/search', searchLimiter, searchQueryValidation, gamesController.searchGames);

// Carrosséis principais
router.get('/trending', gamesController.getTrendingGames);
router.get('/recent', gamesController.getRecentGames);
router.get('/multiplayer', gamesController.getMultiplayerGames);
router.get('/upcoming', gamesController.getUpcomingGames);

// Carrosséis por gênero
router.get('/rpg', gamesController.getBestRPGs);
router.get('/action', gamesController.getBestActionGames);
router.get('/adventure', gamesController.getBestAdventureGames);
router.get('/strategy', gamesController.getBestStrategyGames);
router.get('/horror', gamesController.getBestHorrorGames);

// Carrosséis por plataforma
router.get('/playstation', gamesController.getPlayStationGames);
router.get('/xbox', gamesController.getXboxGames);
router.get('/nintendo', gamesController.getNintendoGames);
router.get('/pc', gamesController.getPCGames);

// Detalhes do jogo (deve ficar por último para não conflitar com rotas acima)
router.get('/:id', gameIdParamValidation, gamesController.getGameDetails);

export default router;
