import type { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | unknown;

export const asyncHandler =
  <Req extends Request = Request>(fn: AsyncRouteHandler<Req>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
