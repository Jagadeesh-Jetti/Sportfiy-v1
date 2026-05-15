import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError.js';
import {
  cancelBookingService,
  createBookingService,
  getBookingByIdService,
  listMyBookingsService,
  listVenueBookingsService,
} from './bookings.service.js';
import type { CreateBookingInput } from './bookings.validator.js';

export const createBookingController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const booking = await createBookingService(req.user.id, req.body as CreateBookingInput);
  res.status(201).json({ booking });
};

export const listMyBookingsController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const result = await listMyBookingsService(req.user.id);
  res.json(result);
};

export const listVenueBookingsController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const bookings = await listVenueBookingsService(req.params.venueId as string, req.user.id);
  res.json({ bookings });
};

export const cancelBookingController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const result = await cancelBookingService(
    req.params.id as string,
    req.user.id,
    req.user.role,
  );
  res.json({ booking: result });
};

export const getBookingController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const booking = await getBookingByIdService(req.params.id as string, req.user.id, req.user.role);
  res.json({ booking });
};
