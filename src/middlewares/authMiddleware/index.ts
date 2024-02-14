import ErrorException from '@lib/ErrorException';
import { prisma } from '@lib/prisma';
import { verifyToken } from '@lib/verifyToken';
import { RequestHandler } from 'express';

export const authMiddleware: RequestHandler = async (req, res, next) => {
	try {
		let token: string | null = null;

		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			const [_bearer, accessToken] = req.headers.authorization.split(' ');

			token = accessToken;
		}

		if (!token) {
			throw new ErrorException(401, { message: 'No token' });
		}

		const decoded = verifyToken(token);

		const user = await prisma.user.findFirst({ where: { id: decoded.id } });

		if (!user) {
			throw new ErrorException(401, { message: 'No user' });
		}

		req.user = user;

		next();
	} catch (error) {
		next(error);
	}
};
