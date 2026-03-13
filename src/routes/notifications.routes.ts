import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import notificationsController from '../controllers/notificationsController';

const router = Router();

router.get('/', authenticate, notificationsController.getNotifications);
router.patch('/:id/read', authenticate, notificationsController.markAsRead);
router.patch('/read-all', authenticate, notificationsController.markAllAsRead);
router.delete('/:id', authenticate, notificationsController.deleteNotification);

export default router;
