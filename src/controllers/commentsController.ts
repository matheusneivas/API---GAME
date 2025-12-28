import { Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';
import igdbService from '../services/igdbService';

export class CommentsController {
  async getCommentsByGame(req: AuthRequest, res: Response) {
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

      const result = await pool.query(
        `SELECT c.*, u.username, u.avatar
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.game_id = $1
         ORDER BY c.created_at DESC
         LIMIT $2 OFFSET $3`,
        [parseInt(gameId), limit, offset]
      );

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM comments WHERE game_id = $1',
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
      console.error('❌ Erro ao buscar comentários do jogo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar comentários do jogo',
      });
    }
  }

  async createComment(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { game_id, content } = req.body;
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
        `INSERT INTO comments (user_id, game_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, game_id, content]
      );

      const userResult = await pool.query(
        'SELECT username, avatar FROM users WHERE id = $1',
        [userId]
      );

      return res.status(201).json({
        success: true,
        data: {
          ...result.rows[0],
          username: userResult.rows[0].username,
          avatar: userResult.rows[0].avatar,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao criar comentário:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar comentário',
      });
    }
  }

  async deleteComment(req: AuthRequest, res: Response) {
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

      const commentCheck = await pool.query(
        'SELECT user_id FROM comments WHERE id = $1',
        [id]
      );

      if (commentCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Comentário não encontrado',
        });
      }

      if (commentCheck.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para deletar este comentário',
        });
      }

      await pool.query('DELETE FROM comments WHERE id = $1', [id]);

      return res.json({
        success: true,
        data: { message: 'Comentário deletado com sucesso' },
      });
    } catch (error) {
      console.error('❌ Erro ao deletar comentário:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao deletar comentário',
      });
    }
  }
}

export default new CommentsController();
