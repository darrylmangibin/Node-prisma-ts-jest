import Joi from 'joi';

export const categoryCreateOrUpdateValidation = Joi.object({
	name: Joi.string().required(),
});
