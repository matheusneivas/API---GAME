import { Router } from 'express';
import friendshipsController from '../controllers/friendshipsController';
import { authMiddleware } from '../middlewares/auth';
import {
  sendFriendRequestValidation,
  friendshipIdParamValidation,
  friendIdParamValidation,
  userIdStatusParamValidation,
} from '../utils/validators';
import { createContentLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Enviar solicitação de amizade
router.post('/', createContentLimiter, sendFriendRequestValidation, friendshipsController.sendFriendRequest);

// Aceitar solicitação de amizade
router.post('/:id/accept', friendshipIdParamValidation, friendshipsController.acceptFriendRequest);

// Rejeitar solicitação de amizade
router.post('/:id/reject', friendshipIdParamValidation, friendshipsController.rejectFriendRequest);

// Remover amigo
router.delete('/:friend_id', friendIdParamValidation, friendshipsController.removeFriend);

// Listar meus amigos
router.get('/', friendshipsController.getFriends);

// Listar solicitações pendentes recebidas
router.get('/pending', friendshipsController.getPendingRequests);

// Listar solicitações enviadas
router.get('/sent', friendshipsController.getSentRequests);

// Verificar status de amizade com um usuário
router.get('/status/:user_id', userIdStatusParamValidation, friendshipsController.getFriendshipStatus);

export default router;
