import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { errorHandler } from './middlewares/errorHandler';
import { generalLimiter } from './middlewares/rateLimiter';

import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import listsRoutes from './routes/lists.routes';
import reviewsRoutes from './routes/reviews.routes';
import commentsRoutes from './routes/comments.routes';
import gamesRoutes from './routes/games.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter geral para todas as rotas da API
app.use('/api', generalLimiter);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Game Tracker API',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/games', gamesRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
