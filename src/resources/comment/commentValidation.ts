import Joi from 'joi';

export const commentCreateOrUpdateValidation = Joi.object({
	body: Joi.string().required(),
});
