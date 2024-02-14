import { NextFunction, Request, Response } from 'express';
import { authMiddleware } from '.';
import { JsonWebTokenError } from 'jsonwebtoken';
import { signToken } from '@lib/signToken';
import userFactory from '@resources/user/UserFactory';

describe('authMiddleware', () => {
	let mockReq: Request;
	let mockRes: Response;
	let mockNextFn: NextFunction;

	beforeEach(() => {
		mockNextFn = jest.fn();
	});

	it('should call next with error when no token', async () => {
		mockReq = {
			headers: {
				authorization: 'Bearer',
			},
		} as Request;

		await authMiddleware(mockReq, mockRes, mockNextFn);

		expect(mockNextFn).toHaveBeenCalledWith(
			expect.objectContaining({ error: { message: 'No token' } }),
		);
		expect(mockReq.user).toBeUndefined();
	});

	it('should call next with error when invalid token', async () => {
		const token = '42HFLSrfj10hnv4';
		mockReq = {
			headers: {
				authorization: `Bearer ${token}`,
			},
		} as Request;

		await authMiddleware(mockReq, mockRes, mockNextFn);

		expect(mockNextFn).toHaveBeenCalledWith(expect.any(JsonWebTokenError));
		expect(mockReq.user).toBeUndefined();
	});

	it('should call next with error when invalid payload', async () => {
		// @ts-ignore
		const token = signToken({});
		mockReq = {
			headers: {
				authorization: `Bearer ${token}`,
			},
		} as Request;

		await authMiddleware(mockReq, mockRes, mockNextFn);

		expect(mockNextFn).toHaveBeenCalledWith(
			expect.objectContaining({ message: 'Invalid payload' }),
		);
		expect(mockReq.user).toBeUndefined();
	});

	it('should call next with error when no user', async () => {
		const id = 0;
		const token = signToken({ id });
		mockReq = {
			headers: {
				authorization: `Bearer ${token}`,
			},
		} as Request;

		await authMiddleware(mockReq, mockRes, mockNextFn);

		expect(mockNextFn).toHaveBeenCalledWith(
			expect.objectContaining({ error: { message: 'No user' } }),
		);
		expect(mockReq.user).toBeUndefined();
	});

	it('should call next without error', async () => {
		const user = await userFactory.create();
		const token = signToken({ id: user.id });
		mockReq = {
			headers: {
				authorization: `Bearer ${token}`,
			},
		} as Request;

		await authMiddleware(mockReq, mockRes, mockNextFn);

		expect(mockNextFn).toHaveBeenCalledWith();
		expect(mockReq.user).toEqual(
			expect.objectContaining({
				id: user.id,
			}),
		);
	});
});
