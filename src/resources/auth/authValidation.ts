import Joi from 'joi';

export const authRegisterValidaion = Joi.object({
	userData: Joi.object({
		name: Joi.string().required().label('Name'),
		email: Joi.string().required().email().label('Email'),
		password: Joi.string().required().min(6).label('Password'),
	}),
	profileData: Joi.object({
		age: Joi.number().required().label('Age'),
		address: Joi.string().required().label('Address'),
	}),
});

export const authLoginValidation = Joi.object({
	email: Joi.string().required().email().label('Email'),
	password: Joi.string().required().label('Password'),
});

export const authUpdateProfileValidation = Joi.object({
	name: Joi.string().required().label('Name'),
	email: Joi.string().required().email().label('Email'),
	age: Joi.number().required().label('Age'),
	address: Joi.string().required().label('Address'),
});

export const authChangePasswordValidation = Joi.object({
	currentPassword: Joi.string().required().label('Current password'),
	newPassword: Joi.string().required().min(6).label('New password'),
});
