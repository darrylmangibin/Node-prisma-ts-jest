import { RequestHandler } from 'express';
import Joi from 'joi';

export const validationMiddleware =
	(schema: Joi.Schema): RequestHandler =>
	async (req, res, next) => {
		try {
			const options = {
				abortEarly: false,
				allowUnknown: true,
				stripUnknown: true,
				errors: {
					wrap: {
						label: '',
						array: '',
						string: '',
					},
				},
			} satisfies Joi.ValidationOptions;

			const values = await schema.validateAsync(req.body, options);

			req.body = values;

			next();
		} catch (error) {
			next(error);
		}
	};
