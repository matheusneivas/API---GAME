import { body, param, query } from 'express-validator';

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username deve ter entre 3 e 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username só pode conter letras, números e underscore'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

export const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username deve ter entre 3 e 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username só pode conter letras, números e underscore'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar deve ser uma URL válida'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio deve ter no máximo 500 caracteres'),
];

export const createListValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ max: 100 })
    .withMessage('Nome deve ter no máximo 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('is_public')
    .optional()
    .isBoolean()
    .withMessage('is_public deve ser true ou false'),
];

export const updateListValidation = [
  param('id').isUUID().withMessage('ID inválido'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nome não pode ser vazio')
    .isLength({ max: 100 })
    .withMessage('Nome deve ter no máximo 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('is_public')
    .optional()
    .isBoolean()
    .withMessage('is_public deve ser true ou false'),
];

export const addGameToListValidation = [
  param('id').isUUID().withMessage('ID da lista inválido'),
  body('game_id')
    .isInt({ min: 1 })
    .withMessage('game_id deve ser um número inteiro positivo'),
];

export const removeGameFromListValidation = [
  param('id').isUUID().withMessage('ID da lista inválido'),
  param('gameId')
    .isInt({ min: 1 })
    .withMessage('ID do jogo deve ser um número inteiro positivo'),
];

export const createReviewValidation = [
  body('game_id')
    .isInt({ min: 1 })
    .withMessage('game_id deve ser um número inteiro positivo'),
  body('rating')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating deve ser um número entre 0 e 10'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Review deve ter no máximo 2000 caracteres'),
];

export const createCommentValidation = [
  body('game_id')
    .isInt({ min: 1 })
    .withMessage('game_id deve ser um número inteiro positivo'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Conteúdo é obrigatório')
    .isLength({ max: 1000 })
    .withMessage('Comentário deve ter no máximo 1000 caracteres'),
];

export const uuidParamValidation = [
  param('id').isUUID().withMessage('ID inválido'),
];

export const gameIdParamValidation = [
  param('gameId')
    .isInt({ min: 1 })
    .withMessage('ID do jogo deve ser um número inteiro positivo'),
];

export const userIdParamValidation = [
  param('userId').isUUID().withMessage('ID do usuário inválido'),
];

export const searchQueryValidation = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Termo de busca é obrigatório')
    .isLength({ min: 2 })
    .withMessage('Termo de busca deve ter no mínimo 2 caracteres'),
];
