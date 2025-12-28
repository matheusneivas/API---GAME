import rateLimit from 'express-rate-limit';

// Limiter geral para toda a API
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requisições por janela
  message: {
    success: false,
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos',
  },
  standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
});

// Limiter para registro de usuários
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Máximo de 5 registros por hora
  message: {
    success: false,
    error: 'Muitas tentativas de registro, tente novamente em 1 hora',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Conta mesmo requisições bem-sucedidas
});

// Limiter para login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo de 10 tentativas de login
  message: {
    success: false,
    error: 'Muitas tentativas de login, tente novamente em 15 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não conta logins bem-sucedidos
});

// Limiter para criação de conteúdo (reviews, comments, lists)
export const createContentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 30, // Máximo de 30 criações por hora
  message: {
    success: false,
    error: 'Muitas criações, tente novamente mais tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter para busca de jogos na IGDB
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // Máximo de 20 buscas por minuto
  message: {
    success: false,
    error: 'Muitas buscas, aguarde um momento antes de tentar novamente',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
