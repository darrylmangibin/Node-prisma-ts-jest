import pagination, { PaginationOptions } from '@lib/pagination';
import { prisma } from '@lib/prisma';
import { Category, Prisma } from '@prisma/client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class CategoryService {
	public async createCategory(data: Prisma.CategoryCreateInput) {
		try {
			const category = await prisma.category.create({ data });

			return category;
		} catch (error) {
			throw error;
		}
	}

	public async findManyCategories(
		options: PaginationOptions<Prisma.CategoryFindManyArgs>,
	) {
		try {
			const results = await pagination<Category, Prisma.CategoryFindManyArgs>(
				'Category',
				options,
			);

			return results;
		} catch (error) {
			throw error;
		}
	}

	public async findCategoryById(categoryId: number) {
		try {
			const category = await prisma.category.findFirstOrThrow({
				where: { id: categoryId },
			});

			return category;
		} catch (error) {
			throw error;
		}
	}

	public async findCategoryAndUpdate(
		categoryId: number,
		data: Prisma.CategoryUpdateInput,
	) {
		try {
			const category = await prisma.category.update({
				where: { id: categoryId },
				data,
			});

			return category;
		} catch (error) {
			throw error;
		}
	}

	public async findCategoryAndDelete(categoryId: number) {
		try {
			const category = await prisma.category.delete({
				where: { id: categoryId },
			});

			return category;
		} catch (error) {
			throw error;
		}
	}
}
