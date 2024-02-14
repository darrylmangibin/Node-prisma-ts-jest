import { Router } from 'express';
import { autoInjectable } from 'tsyringe';
import { UserController } from './UserController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import { userUpdateValidation } from './userValidation';
import { adminMiddleware } from '@middlewares/adminMiddleware';

@autoInjectable()
export class UserRoutes implements AppRoute {
	public path = 'users';
	public router = Router();

	private userController: UserController;

	constructor(userController?: UserController) {
		this.userController = userController!;

		this.registerRoutes();
	}

	public registerRoutes() {
		this.router.use(authMiddleware);
		this.router.route('/').get(this.userController.findManyUsers);

		this.router
			.route('/:userId')
			.get(this.userController.findUserById)
			.put(
				adminMiddleware,
				validationMiddleware(userUpdateValidation),
				this.userController.findUserAndUpdate,
			)
			.delete(adminMiddleware, this.userController.findUserAndDelete);
	}
}
