import { Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';

export class UsersController {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { id } = req.params;

      const result = await pool.query(
        'SELECT id, username, avatar, bio, created_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
        });
      }

      return res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar perfil',
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { username, avatar, bio } = req.body;
      const userId = req.user!.id;

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (username !== undefined) {
        const usernameExists = await pool.query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [username, userId]
        );

        if (usernameExists.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Username já está em uso',
          });
        }

        updates.push(`username = $${paramCount}`);
        values.push(username);
        paramCount++;
      }

      if (avatar !== undefined) {
        updates.push(`avatar = $${paramCount}`);
        values.push(avatar);
        paramCount++;
      }

      if (bio !== undefined) {
        updates.push(`bio = $${paramCount}`);
        values.push(bio);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum campo para atualizar',
        });
      }

      updates.push(`updated_at = NOW()`);
      values.push(userId);

      const query = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, email, username, avatar, bio, updated_at
      `;

      const result = await pool.query(query, values);

      return res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar perfil',
      });
    }
  }
}

export default new UsersController();
