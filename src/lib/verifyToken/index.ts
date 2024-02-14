import jwt from 'jsonwebtoken';

export const isAppPayload = (decoded: unknown): decoded is AppPayload =>
	decoded !== undefined && decoded !== null && decoded.hasOwnProperty('id');

export const verifyToken = (token: string): AppPayload => {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);

		if (!isAppPayload(decoded)) {
			throw new Error('Invalid payload');
		}

		return decoded;
	} catch (error) {
		throw error;
	}
};
