import { Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';
import igdbService from '../services/igdbService';

export class ReviewsController {
  async getReviewsByGame(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { gameId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const sort = (req.query.sort as string) || 'created_at';
      const order = (req.query.order as string) || 'desc';

      const validSorts = ['created_at', 'rating', 'updated_at'];
      const validOrders = ['asc', 'desc'];
      const sortField = validSorts.includes(sort) ? sort : 'created_at';
      const sortOrder = validOrders.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

      const query = `
        SELECT r.*, u.username, u.avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.game_id = $1
        ORDER BY r.${sortField} ${sortOrder}
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [parseInt(gameId), limit, offset]);

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM reviews WHERE game_id = $1',
        [parseInt(gameId)]
      );
      const total = parseInt(countResult.rows[0].count);

      return res.json({
        success: true,
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do jogo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar avaliações do jogo',
      });
    }
  }

  async getReviewsByUser(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const result = await pool.query(
        `SELECT r.*
         FROM reviews r
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM reviews WHERE user_id = $1',
        [userId]
      );
      const total = parseInt(countResult.rows[0].count);

      return res.json({
        success: true,
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do usuário:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar avaliações do usuário',
      });
    }
  }

  async createOrUpdateReview(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { game_id, rating, review } = req.body;
      const userId = req.user!.id;

      // Validar se o jogo existe na IGDB
      try {
        await igdbService.getGameById(game_id);
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: 'Jogo não encontrado na IGDB',
        });
      }

      const result = await pool.query(
        `INSERT INTO reviews (user_id, game_id, rating, review)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, game_id)
         DO UPDATE SET
           rating = EXCLUDED.rating,
           review = EXCLUDED.review,
           updated_at = NOW()
         RETURNING *`,
        [userId, game_id, rating, review || null]
      );

      return res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('❌ Erro ao criar/atualizar avaliação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar/atualizar avaliação',
      });
    }
  }

  async deleteReview(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { id } = req.params;
      const userId = req.user!.id;

      const reviewCheck = await pool.query(
        'SELECT user_id FROM reviews WHERE id = $1',
        [id]
      );

      if (reviewCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Avaliação não encontrada',
        });
      }

      if (reviewCheck.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para deletar esta avaliação',
        });
      }

      await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

      return res.json({
        success: true,
        data: { message: 'Avaliação deletada com sucesso' },
      });
    } catch (error) {
      console.error('❌ Erro ao deletar avaliação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao deletar avaliação',
      });
    }
  }
}

export default new ReviewsController();
