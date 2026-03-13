import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';

export class NotificationsController {
  // Buscar notificações do usuário
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const unreadOnly = req.query.unread === 'true';

      const whereClause = unreadOnly
        ? 'WHERE user_id = $1 AND read = false'
        : 'WHERE user_id = $1';

      const result = await pool.query(
        `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT 50`,
        [userId]
      );

      const unreadCount = await pool.query(
        'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
        [userId]
      );

      return res.json({
        success: true,
        data: result.rows,
        unread_count: parseInt(unreadCount.rows[0].count),
      });
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      return res.status(500).json({ success: false, error: 'Erro ao buscar notificações' });
    }
  }

  // Marcar uma notificação como lida
  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Notificação não encontrada' });
      }

      return res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      return res.status(500).json({ success: false, error: 'Erro ao marcar notificação como lida' });
    }
  }

  // Marcar todas as notificações como lidas
  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      await pool.query(
        'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
        [userId]
      );

      return res.json({ success: true, data: { message: 'Todas as notificações marcadas como lidas' } });
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
      return res.status(500).json({ success: false, error: 'Erro ao marcar notificações como lidas' });
    }
  }

  // Deletar uma notificação
  async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Notificação não encontrada' });
      }

      return res.json({ success: true, data: { message: 'Notificação deletada' } });
    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error);
      return res.status(500).json({ success: false, error: 'Erro ao deletar notificação' });
    }
  }
}

// Função auxiliar para criar notificações (usada por outros controllers)
export async function createNotification(
  userId: string,
  type: string,
  data: Record<string, any>
) {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, type, data) VALUES ($1, $2, $3)',
      [userId, type, JSON.stringify(data)]
    );
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
  }
}

export default new NotificationsController();
