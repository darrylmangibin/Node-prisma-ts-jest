import jwt from 'jsonwebtoken';
import { signToken } from '.';

describe('signToken', () => {
	it('should generate token', () => {
		const id = 1;

		const token = signToken({ id });

		expect(typeof token).toBe('string');
		expect(jwt.verify(token, process.env.JWT_SECRET as jwt.Secret)).toEqual(
			expect.objectContaining({ id }),
		);
	});
});
