import Joi from 'joi';
import { validationMiddleware } from '.';
import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';

describe('validationMiddleware', () => {
	const validation = Joi.object({
		name: Joi.string().required(),
	});
	let mockReq: Request;
	let mockRes: Response;
	let mockNextFn: NextFunction;

	beforeEach(() => {
		mockNextFn = jest.fn();
	});

	it('should call next with error', async () => {
		mockReq = {
			body: {},
		} as unknown as Request;
		const handler = validationMiddleware(validation);

		await handler(mockReq, mockRes, mockNextFn);

		expect(mockNextFn).toHaveBeenCalledWith(expect.any(Joi.ValidationError));
	});

	it('should call next without error', async () => {
		mockReq = {
			body: {
				name: faker.person.fullName(),
			},
		} as unknown as Request;
		const handler = validationMiddleware(validation);

		await handler(mockReq, mockRes, mockNextFn);

		expect(mockNextFn).toHaveBeenCalledWith();
	});
});
