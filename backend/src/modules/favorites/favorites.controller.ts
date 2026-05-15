import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError.js';
import {
  getMyFavoriteIdsService,
  listMyFavoritesService,
  toggleFavoriteService,
} from './favorites.service.js';

export const toggleFavoriteController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const result = await toggleFavoriteService(req.user.id, req.params.venueId as string);
  res.json(result);
};

export const listMyFavoritesController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const venues = await listMyFavoritesService(req.user.id);
  res.json({ venues });
};

export const myFavoriteIdsController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const ids = await getMyFavoriteIdsService(req.user.id);
  res.json({ ids });
};
