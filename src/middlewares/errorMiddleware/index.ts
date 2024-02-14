import ErrorException from '@lib/ErrorException';
import {
	PrismaClientKnownRequestError,
	PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { ErrorRequestHandler } from 'express';
import Joi from 'joi';

export const errorMiddleware: ErrorRequestHandler = async (
	err: ErrorException,
	req,
	res,
	next,
) => {
	let error = { ...err };
	let errorObj: Record<string, unknown> = {};

	// console.log(JSON.stringify(err, null, 4));

	if (err instanceof Joi.ValidationError) {
		err.details.forEach((detail) => {
			errorObj[detail.context?.key as string] = detail.message;
		});

		error = new ErrorException(422, errorObj);
	}

	if (err instanceof PrismaClientKnownRequestError) {
		if (err.code === 'P2025') {
			error = new ErrorException(404);
		}

		if (err.code === 'P2002') {
			const [key] = err.meta?.target as string[];
			error = new ErrorException(400, {
				[key]: 'Already exists',
			});
		}
	}

	if (err instanceof PrismaClientValidationError) {
		error = new ErrorException(400);
	}

	res.status(error.statusCode || 500).json({
		message: error.message || err.message || 'Something went wrong',
		error: error.error,
	});
};
