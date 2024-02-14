import { Router } from 'express';
import { autoInjectable } from 'tsyringe';
import { CategoryController } from './CategoryController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import { categoryCreateOrUpdateValidation } from './categoryValidation';
import { adminMiddleware } from '@middlewares/adminMiddleware';

@autoInjectable()
export class CategoryRoutes implements AppRoute {
	public path = 'categories';
	public router = Router();

	private categoryController: CategoryController;

	constructor(categoryController?: CategoryController) {
		this.categoryController = categoryController!;

		this.registerRoutes();
	}

	public registerRoutes() {
		this.router.use(authMiddleware);
		this.router
			.route('/')
			.get(this.categoryController.findManyCategories)
			.post(
				adminMiddleware,
				validationMiddleware(categoryCreateOrUpdateValidation),
				this.categoryController.createCategory,
			);

		this.router
			.route('/:categoryId')
			.get(this.categoryController.findCategoryById)
			.put(
				adminMiddleware,
				validationMiddleware(categoryCreateOrUpdateValidation),
				this.categoryController.findCategoryAndUpdate,
			)
			.delete(adminMiddleware, this.categoryController.findCategoryAndDelete);
	}
}
