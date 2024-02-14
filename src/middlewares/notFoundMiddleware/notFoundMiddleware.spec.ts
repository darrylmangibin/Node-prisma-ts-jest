import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import { notFoundMiddleware } from '.';

describe('notFoundMiddleware', () => {
	it('should return 404 error response', async () => {
		const mockReq = {
			path: '/api/not-found',
			method: 'GET',
		} as unknown as Request;
		const mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;
		const mockNextFn: NextFunction = jest.fn();

		notFoundMiddleware(mockReq, mockRes, mockNextFn);

		expect(mockRes.status).toHaveBeenCalledWith(404);
		expect(mockRes.json).toHaveBeenCalledWith(
			`Route ${mockReq.method} ${mockReq.path} does not exists`,
		);
	});
});
