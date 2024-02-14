import { autoInjectable } from 'tsyringe';
import { CategoryService } from '../CategoryService';
import { RequestHandler } from 'express';
import { paginationQuery } from '@lib/pagination';
import { Prisma } from '@prisma/client';

@autoInjectable()
export class CategoryController {
	private categoryService: CategoryService;

	constructor(categoryService?: CategoryService) {
		this.categoryService = categoryService!;
	}

	public createCategory: RequestHandler = async (req, res, next) => {
		try {
			const category = await this.categoryService.createCategory(req.body);

			return res.status(201).json(category);
		} catch (error) {
			next(error);
		}
	};

	public findManyCategories: RequestHandler = async (req, res, next) => {
		try {
			const options = paginationQuery<Prisma.CategoryFindManyArgs>(req.query);

			const results = await this.categoryService.findManyCategories(options);

			return res.status(200).json(results);
		} catch (error) {
			next(error);
		}
	};

	public findCategoryById: RequestHandler = async (req, res, next) => {
		try {
			const category = await this.categoryService.findCategoryById(
				Number(req.params.categoryId),
			);

			return res.status(200).json(category);
		} catch (error) {
			next(error);
		}
	};

	public findCategoryAndUpdate: RequestHandler = async (req, res, next) => {
		try {
			const category = await this.categoryService.findCategoryAndUpdate(
				Number(req.params.categoryId),
				req.body,
			);

			return res.status(200).json(category);
		} catch (error) {
			next(error);
		}
	};

	public findCategoryAndDelete: RequestHandler = async (req, res, next) => {
		try {
			const category = await this.categoryService.findCategoryAndDelete(
				Number(req.params.categoryId),
			);

			return res.status(200).json(category);
		} catch (error) {
			next(error);
		}
	};
}
