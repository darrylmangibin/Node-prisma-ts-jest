import Joi from 'joi';

export const userUpdateValidation = Joi.object({
	name: Joi.string().required().label('Name'),
	email: Joi.string().required().email().label('Email'),
	role: Joi.string().required().valid('user', 'admin').label('Role'),
	age: Joi.number().required().label('Age'),
	address: Joi.string().required().label('Address'),
});
