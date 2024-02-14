import ErrorException from '@lib/ErrorException';
import { RequestHandler } from 'express';

export const adminMiddleware: RequestHandler = (req, res, next) => {
	if (req.user.role !== 'admin') {
		return next(new ErrorException(403));
	}

	next();
};
