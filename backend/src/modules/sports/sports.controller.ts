import type { Request, Response } from 'express';
import { listSportsService } from './sports.service.js';

export const listSportsController = async (_req: Request, res: Response) => {
  const sports = await listSportsService();
  res.json({ sports });
};
