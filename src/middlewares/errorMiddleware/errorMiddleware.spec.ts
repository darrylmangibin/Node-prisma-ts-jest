import { NextFunction, Request, Response } from 'express';
import { errorMiddleware } from '.';
import Joi from 'joi';
import ErrorException from '@lib/ErrorException';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('errorMiddleware', () => {
	let mockReq: Request;
	let mockRes: Response;
	let mockNextFn: NextFunction;

	beforeEach(() => {
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		} as unknown as Response;
	});
	mockNextFn = jest.fn();

	it('should return 500 error response', () => {
		const error = {};

		errorMiddleware(error, mockReq, mockRes, mockNextFn);

		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith({
			message: 'Something went wrong',
		});
	});

	it('should return 422 error response - Joi ValidationError', () => {
		const error = new Joi.ValidationError(
			'Validation failed',
			[
				{
					message: 'This is required',
					path: ['name'],
					type: 'failed',
					context: {
						key: 'name',
					},
				},
			],
			'failed',
		);

		errorMiddleware(error, mockReq, mockRes, mockNextFn);

		expect(mockRes.status).toHaveBeenCalledWith(422);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				message: ErrorException.errorStatusCode[422],
				error: expect.objectContaining({
					name: 'This is required',
				}),
			}),
		);
	});

	it('should return 422 error response - PrismaClientKnownRequestError P2025', () => {
		const error = new PrismaClientKnownRequestError('error', {
			code: 'P2025',
			clientVersion: '1.8.4',
		});

		errorMiddleware(error, mockReq, mockRes, mockNextFn);

		expect(mockRes.status).toHaveBeenCalledWith(404);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				message: ErrorException.errorStatusCode[404],
			}),
		);
	});
});
