import { Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';

export class FriendshipsController {
  // Enviar solicitação de amizade
  async sendFriendRequest(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const userId = req.user!.id;
      const { friend_id } = req.body;

      // Verificar se está tentando adicionar a si mesmo
      if (userId === friend_id) {
        return res.status(400).json({
          success: false,
          error: 'Você não pode adicionar a si mesmo como amigo',
        });
      }

      // Verificar se o usuário amigo existe
      const friendExists = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [friend_id]
      );

      if (friendExists.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
        });
      }

      // Verificar se já existe uma solicitação ou amizade
      const existingFriendship = await pool.query(
        `SELECT * FROM friendships
         WHERE (user_id = $1 AND friend_id = $2)
         OR (user_id = $2 AND friend_id = $1)`,
        [userId, friend_id]
      );

      if (existingFriendship.rows.length > 0) {
        const status = existingFriendship.rows[0].status;
        if (status === 'accepted') {
          return res.status(400).json({
            success: false,
            error: 'Vocês já são amigos',
          });
        } else if (status === 'pending') {
          return res.status(400).json({
            success: false,
            error: 'Já existe uma solicitação de amizade pendente',
          });
        }
      }

      // Criar solicitação de amizade
      const result = await pool.query(
        `INSERT INTO friendships (user_id, friend_id, status)
         VALUES ($1, $2, 'pending')
         RETURNING *`,
        [userId, friend_id]
      );

      return res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('❌ Erro ao enviar solicitação de amizade:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao enviar solicitação de amizade',
      });
    }
  }

  // Aceitar solicitação de amizade
  async acceptFriendRequest(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const userId = req.user!.id;
      const { id } = req.params;

      // Verificar se a solicitação existe e é para este usuário
      const friendship = await pool.query(
        `SELECT * FROM friendships
         WHERE id = $1 AND friend_id = $2 AND status = 'pending'`,
        [id, userId]
      );

      if (friendship.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Solicitação de amizade não encontrada',
        });
      }

      // Aceitar solicitação
      const result = await pool.query(
        `UPDATE friendships
         SET status = 'accepted', updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      return res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('❌ Erro ao aceitar solicitação de amizade:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao aceitar solicitação de amizade',
      });
    }
  }

  // Rejeitar solicitação de amizade
  async rejectFriendRequest(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const userId = req.user!.id;
      const { id } = req.params;

      // Verificar se a solicitação existe e é para este usuário
      const friendship = await pool.query(
        `SELECT * FROM friendships
         WHERE id = $1 AND friend_id = $2 AND status = 'pending'`,
        [id, userId]
      );

      if (friendship.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Solicitação de amizade não encontrada',
        });
      }

      // Rejeitar solicitação (ou deletar)
      await pool.query('DELETE FROM friendships WHERE id = $1', [id]);

      return res.json({
        success: true,
        data: { message: 'Solicitação de amizade rejeitada' },
      });
    } catch (error) {
      console.error('❌ Erro ao rejeitar solicitação de amizade:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao rejeitar solicitação de amizade',
      });
    }
  }

  // Remover amigo
  async removeFriend(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const userId = req.user!.id;
      const { friend_id } = req.params;

      // Remover amizade (em qualquer direção)
      const result = await pool.query(
        `DELETE FROM friendships
         WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
         AND status = 'accepted'
         RETURNING *`,
        [userId, friend_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Amizade não encontrada',
        });
      }

      return res.json({
        success: true,
        data: { message: 'Amigo removido com sucesso' },
      });
    } catch (error) {
      console.error('❌ Erro ao remover amigo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao remover amigo',
      });
    }
  }

  // Listar amigos
  async getFriends(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const result = await pool.query(
        `SELECT
          u.id, u.username, u.avatar, u.bio, f.created_at as friends_since
         FROM friendships f
         JOIN users u ON (
           CASE
             WHEN f.user_id = $1 THEN u.id = f.friend_id
             ELSE u.id = f.user_id
           END
         )
         WHERE (f.user_id = $1 OR f.friend_id = $1)
         AND f.status = 'accepted'
         ORDER BY f.created_at DESC`,
        [userId]
      );

      return res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar amigos:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar amigos',
      });
    }
  }

  // Listar solicitações pendentes recebidas
  async getPendingRequests(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const result = await pool.query(
        `SELECT
          f.id, f.created_at,
          u.id as user_id, u.username, u.avatar, u.bio
         FROM friendships f
         JOIN users u ON u.id = f.user_id
         WHERE f.friend_id = $1 AND f.status = 'pending'
         ORDER BY f.created_at DESC`,
        [userId]
      );

      return res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações pendentes:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar solicitações pendentes',
      });
    }
  }

  // Listar solicitações enviadas
  async getSentRequests(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const result = await pool.query(
        `SELECT
          f.id, f.created_at,
          u.id as friend_id, u.username, u.avatar, u.bio
         FROM friendships f
         JOIN users u ON u.id = f.friend_id
         WHERE f.user_id = $1 AND f.status = 'pending'
         ORDER BY f.created_at DESC`,
        [userId]
      );

      return res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações enviadas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar solicitações enviadas',
      });
    }
  }

  // Verificar status de amizade com um usuário
  async getFriendshipStatus(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const userId = req.user!.id;
      const { user_id } = req.params;

      if (userId === user_id) {
        return res.json({
          success: true,
          data: { status: 'self' },
        });
      }

      const result = await pool.query(
        `SELECT status, user_id, friend_id FROM friendships
         WHERE (user_id = $1 AND friend_id = $2)
         OR (user_id = $2 AND friend_id = $1)`,
        [userId, user_id]
      );

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          data: { status: 'none' },
        });
      }

      const friendship = result.rows[0];

      // Se pending, verificar quem enviou
      if (friendship.status === 'pending') {
        const sentByMe = friendship.user_id === userId;
        return res.json({
          success: true,
          data: {
            status: 'pending',
            sentByMe
          },
        });
      }

      return res.json({
        success: true,
        data: { status: friendship.status },
      });
    } catch (error) {
      console.error('❌ Erro ao verificar status de amizade:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar status de amizade',
      });
    }
  }
}

export default new FriendshipsController();
