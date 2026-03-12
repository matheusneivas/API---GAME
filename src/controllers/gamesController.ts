import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import igdbService from '../services/igdbService';

export class GamesController {
  async searchGames(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;

      const data = await igdbService.searchGames(q as string, limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos',
      });
    }
  }

  async getGameDetails(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { id } = req.params;

      const data = await igdbService.getGameById(parseInt(id));

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes do jogo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar detalhes do jogo',
      });
    }
  }

  async getTrendingGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      const data = await igdbService.getTrendingGames(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos em alta:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos em alta',
      });
    }
  }

  async getRecentGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      const data = await igdbService.getRecentReleases(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar lançamentos recentes:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar lançamentos recentes',
      });
    }
  }

  async getMultiplayerGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await igdbService.getMultiplayerGames(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos multiplayer:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos multiplayer',
      });
    }
  }

  async getUpcomingGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await igdbService.getUpcomingGames(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos aguardados:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos aguardados',
      });
    }
  }

  async getBestRPGs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await igdbService.getBestRPGs(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar RPGs:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar RPGs',
      });
    }
  }

  async getBestActionGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await igdbService.getBestActionGames(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos de ação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos de ação',
      });
    }
  }

  async getBestAdventureGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await igdbService.getBestAdventureGames(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos de aventura:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos de aventura',
      });
    }
  }

  async getBestStrategyGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await igdbService.getBestStrategyGames(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos de estratégia:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos de estratégia',
      });
    }
  }

  async getBestHorrorGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await igdbService.getBestHorrorGames(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos de terror:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos de terror',
      });
    }
  }

  async getPlayStationGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await igdbService.getPlayStationGames(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos PlayStation:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos PlayStation',
      });
    }
  }

  async getXboxGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await igdbService.getXboxGames(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos Xbox:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos Xbox',
      });
    }
  }

  async getNintendoGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await igdbService.getNintendoGames(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos Nintendo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos Nintendo',
      });
    }
  }

  async getPCGames(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await igdbService.getPCGames(limit);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar jogos PC:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogos PC',
      });
    }
  }
}

export default new GamesController();
