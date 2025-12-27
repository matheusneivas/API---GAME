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
}

export default new GamesController();
