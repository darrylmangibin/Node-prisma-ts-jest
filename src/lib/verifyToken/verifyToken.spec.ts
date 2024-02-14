import { JsonWebTokenError, Secret, sign } from 'jsonwebtoken';
import { verifyToken } from '.';
import { signToken } from '@lib/signToken';

describe('verifyToken', () => {
	it('should throw error when token is invalid', async () => {
		const token = 'fqnHF93nBo2951';

		const verify = async () => {
			await verifyToken(token);
		};

		await expect(verify).rejects.toThrow('jwt malformed');
	});

	it('should throw error when payload is invalid', async () => {
		const token = sign({}, process.env.JWT_SECRET as Secret);

		const verify = () => {
			verifyToken(token);
		};

		expect(verify).toThrow('Invalid payload');
	});

	it('should decode the token', () => {
		const id = 1;
		const token = signToken({ id });

		const decoded = verifyToken(token);

		expect(decoded).toEqual(expect.objectContaining({ id }));
	});
});
