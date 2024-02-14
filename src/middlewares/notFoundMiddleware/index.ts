import { RequestHandler } from 'express';

export const notFoundMiddleware: RequestHandler = (req, res, next) => {
	res.status(404).json(`Route ${req.method} ${req.path} does not exists`);
};
