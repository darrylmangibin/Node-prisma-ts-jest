import Joi from 'joi';

export const postCreateOrUpdateValidation = Joi.object({
	title: Joi.string().required(),
	details: Joi.string().required(),
});
