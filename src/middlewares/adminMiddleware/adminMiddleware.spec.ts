import { NextFunction, Request, Response } from 'express';
import { adminMiddleware } from '.';

describe('adminMiddleware', () => {
	let mockReq: Request;
	let mockRes: Response;
	let mockNextFn: NextFunction;

	beforeEach(() => {
		mockNextFn = jest.fn();
	});

	it('should call next with error', () => {
		mockReq = {
			user: {
				role: 'user',
			},
		} as Request;

		adminMiddleware(mockReq, mockRes, mockNextFn);

		expect(mockNextFn).toHaveBeenCalledWith(
			expect.objectContaining({ message: 'Forbidden' }),
		);
	});

	it('should call next without error', () => {
		mockReq = {
			user: {
				role: 'admin',
			},
		} as Request;

		adminMiddleware(mockReq, mockRes, mockNextFn);

		expect(mockNextFn).toHaveBeenCalledWith();
	});
});
