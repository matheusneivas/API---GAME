import { Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { AuthRequest } from '../types';

export class AuthController {
  async register(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { email, username, password } = req.body;

      const userExists = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (userExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email ou username já cadastrado',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO users (email, username, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, username, created_at`,
        [email, username, passwordHash]
      );

      const user = result.rows[0];

      const jwtSecret = process.env.JWT_SECRET || 'default_secret';
      const jwtExpires = process.env.JWT_EXPIRES_IN || '7d';
      // @ts-ignore
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        jwtSecret,
        { expiresIn: jwtExpires }
      );

      return res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            created_at: user.created_at,
          },
          token,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao registrar usuário:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao registrar usuário',
      });
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { email, password } = req.body;

      const result = await pool.query(
        'SELECT id, email, username, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas',
        });
      }

      const user = result.rows[0];

      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas',
        });
      }

      const jwtSecret = process.env.JWT_SECRET || 'default_secret';
      const jwtExpires = process.env.JWT_EXPIRES_IN || '7d';
      // @ts-ignore
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        jwtSecret,
        { expiresIn: jwtExpires }
      );

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
          token,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao fazer login',
      });
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        'SELECT id, email, username, avatar, bio, created_at FROM users WHERE id = $1',
        [req.user!.id]
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
      console.error('❌ Erro ao buscar usuário:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar usuário',
      });
    }
  }
}

export default new AuthController();
