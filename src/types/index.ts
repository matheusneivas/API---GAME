import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  avatar?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  created_at: Date;
}

export interface List {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ListItem {
  id: string;
  list_id: string;
  game_id: number;
  added_at: Date;
}

export interface Review {
  id: string;
  user_id: string;
  game_id: number;
  rating: number;
  review?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: string;
  user_id: string;
  game_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
