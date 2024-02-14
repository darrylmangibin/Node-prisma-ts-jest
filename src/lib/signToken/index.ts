import jwt from 'jsonwebtoken';

export const signToken = (
	payload: AppPayload,
	options?: jwt.SignOptions,
): string => {
	try {
		const token = jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
			expiresIn: '30d',
			...options,
		});

		return token;
	} catch (error) {
		throw error;
	}
};
