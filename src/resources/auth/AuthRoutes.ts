import { Router } from 'express';
import { autoInjectable } from 'tsyringe';
import { AuthController } from './AuthController';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import {
	authChangePasswordValidation,
	authLoginValidation,
	authRegisterValidaion,
	authUpdateProfileValidation,
} from './authValidation';
import { authMiddleware } from '@middlewares/authMiddleware';

@autoInjectable()
export class AuthRoutes implements AppRoute {
	public path = 'auth';
	public router = Router();
	private authController: AuthController;

	constructor(authController?: AuthController) {
		this.authController = authController!;
		this.registerRoutes();
	}

	public registerRoutes() {
		this.router.post(
			'/register',
			validationMiddleware(authRegisterValidaion),
			this.authController.register,
		);

		this.router.post(
			'/login',
			validationMiddleware(authLoginValidation),
			this.authController.login,
		);

		this.router
			.route('/profile')
			.get(authMiddleware, this.authController.getProfile)
			.put(
				authMiddleware,
				validationMiddleware(authUpdateProfileValidation),
				this.authController.updateProfile,
			)
			.delete(authMiddleware, this.authController.deleteProfile);

		this.router.put(
			'/change-password',
			authMiddleware,
			validationMiddleware(authChangePasswordValidation),
			this.authController.changePassword,
		);
	}
}
