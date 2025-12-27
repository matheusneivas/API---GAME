import { Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';

export class ListsController {
  async getPublicLists(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT l.*, u.username, u.avatar
         FROM lists l
         JOIN users u ON l.user_id = u.id
         WHERE l.is_public = true
         ORDER BY l.created_at DESC`
      );

      return res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar listas públicas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar listas públicas',
      });
    }
  }

  async getMyLists(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const result = await pool.query(
        `SELECT l.*
         FROM lists l
         WHERE l.user_id = $1
         ORDER BY l.created_at DESC`,
        [userId]
      );

      return res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar minhas listas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar minhas listas',
      });
    }
  }

  async getListById(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { id } = req.params;

      const listResult = await pool.query(
        `SELECT l.*, u.username, u.avatar
         FROM lists l
         JOIN users u ON l.user_id = u.id
         WHERE l.id = $1`,
        [id]
      );

      if (listResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Lista não encontrada',
        });
      }

      const list = listResult.rows[0];

      if (!list.is_public && list.user_id !== req.user?.id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado',
        });
      }

      const itemsResult = await pool.query(
        'SELECT game_id, added_at FROM list_items WHERE list_id = $1 ORDER BY added_at DESC',
        [id]
      );

      return res.json({
        success: true,
        data: {
          ...list,
          items: itemsResult.rows,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao buscar lista:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar lista',
      });
    }
  }

  async createList(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { name, description, is_public = true } = req.body;
      const userId = req.user!.id;

      const result = await pool.query(
        `INSERT INTO lists (name, description, is_public, user_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, description || null, is_public, userId]
      );

      return res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('❌ Erro ao criar lista:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar lista',
      });
    }
  }

  async updateList(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { id } = req.params;
      const { name, description, is_public } = req.body;
      const userId = req.user!.id;

      const listCheck = await pool.query(
        'SELECT user_id FROM lists WHERE id = $1',
        [id]
      );

      if (listCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Lista não encontrada',
        });
      }

      if (listCheck.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para editar esta lista',
        });
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount}`);
        values.push(name);
        paramCount++;
      }

      if (description !== undefined) {
        updates.push(`description = $${paramCount}`);
        values.push(description);
        paramCount++;
      }

      if (is_public !== undefined) {
        updates.push(`is_public = $${paramCount}`);
        values.push(is_public);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum campo para atualizar',
        });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE lists
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      return res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar lista:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar lista',
      });
    }
  }

  async deleteList(req: AuthRequest, res: Response) {
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

      const listCheck = await pool.query(
        'SELECT user_id FROM lists WHERE id = $1',
        [id]
      );

      if (listCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Lista não encontrada',
        });
      }

      if (listCheck.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para deletar esta lista',
        });
      }

      await pool.query('DELETE FROM list_items WHERE list_id = $1', [id]);
      await pool.query('DELETE FROM lists WHERE id = $1', [id]);

      return res.json({
        success: true,
        data: { message: 'Lista deletada com sucesso' },
      });
    } catch (error) {
      console.error('❌ Erro ao deletar lista:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao deletar lista',
      });
    }
  }

  async addGameToList(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { id } = req.params;
      const { game_id } = req.body;
      const userId = req.user!.id;

      const listCheck = await pool.query(
        'SELECT user_id FROM lists WHERE id = $1',
        [id]
      );

      if (listCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Lista não encontrada',
        });
      }

      if (listCheck.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para modificar esta lista',
        });
      }

      const result = await pool.query(
        `INSERT INTO list_items (list_id, game_id)
         VALUES ($1, $2)
         ON CONFLICT (list_id, game_id) DO NOTHING
         RETURNING *`,
        [id, game_id]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Jogo já está na lista',
        });
      }

      return res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('❌ Erro ao adicionar jogo à lista:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao adicionar jogo à lista',
      });
    }
  }

  async removeGameFromList(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { id, gameId } = req.params;
      const userId = req.user!.id;

      const listCheck = await pool.query(
        'SELECT user_id FROM lists WHERE id = $1',
        [id]
      );

      if (listCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Lista não encontrada',
        });
      }

      if (listCheck.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para modificar esta lista',
        });
      }

      const result = await pool.query(
        'DELETE FROM list_items WHERE list_id = $1 AND game_id = $2 RETURNING *',
        [id, parseInt(gameId)]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Jogo não encontrado na lista',
        });
      }

      return res.json({
        success: true,
        data: { message: 'Jogo removido da lista com sucesso' },
      });
    } catch (error) {
      console.error('❌ Erro ao remover jogo da lista:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao remover jogo da lista',
      });
    }
  }
}

export default new ListsController();
