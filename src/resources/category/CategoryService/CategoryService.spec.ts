import { faker } from '@faker-js/faker';
import { CategoryService } from '.';
import {
	PrismaClientKnownRequestError,
	PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import categoryFactory from '../CategoryFactory';
import { PaginationOptions, paginationKeys } from '@lib/pagination';
import { Category, Prisma } from '@prisma/client';

describe('CategoryService', () => {
	const categoryService = new CategoryService();

	describe('create', () => {
		const data = {
			name: faker.commerce.department(),
		};

		it('should throw validation error', async () => {
			const create = async () => {
				// @ts-ignore
				await categoryService.createCategory({});
			};

			await expect(create).rejects.toBeInstanceOf(PrismaClientValidationError);
		});

		it('should return category', async () => {
			const category = await categoryService.createCategory(data);

			expect(category).toEqual(
				expect.objectContaining({
					id: expect.any(Number),
					...data,
				}),
			);
		});
	});

	describe('findManyCategories', () => {
		let count: number;

		beforeEach(async () => {
			({ count } = await categoryFactory.createMany(4));
		});

		it('should return paginated categories', async () => {
			const options = {
				pageNumber: 1,
				pageSize: 2,
			} satisfies PaginationOptions<Prisma.CategoryFindFirstArgs>;

			const results = await categoryService.findManyCategories(options);

			expect(Object.keys(results)).toEqual(
				expect.arrayContaining(paginationKeys),
			);
			expect(results.data).toHaveLength(options.pageSize);
			expect(results.totalCount).toBe(count);
			expect(results.data).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: expect.any(Number),
						name: expect.any(String),
					}),
				]),
			);
		});
	});

	describe('findCategoryById', () => {
		let category: Category;

		beforeEach(async () => {
			category = await categoryFactory.create();
		});

		it('should throw not found error', async () => {
			const id = 0;
			const findCategoryById = async () => {
				await categoryService.findCategoryById(id);
			};

			await expect(findCategoryById).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findCategoryById).rejects.toThrow(
				expect.objectContaining({ code: 'P2025' }),
			);
		});

		it('should return comment', async () => {
			const foundCategory = await categoryService.findCategoryById(category.id);

			expect(foundCategory).toEqual(
				expect.objectContaining({
					id: category.id,
				}),
			);
		});
	});

	describe('findCategoryAndUpdate', () => {
		let category: Category;
		const data = {
			name: faker.commerce.department(),
		};

		beforeEach(async () => {
			category = await categoryFactory.create();
		});

		it('should throw not found error', async () => {
			const id = 0;
			const findCategoryAndUpdate = async () => {
				await categoryService.findCategoryAndUpdate(id, data);
			};

			await expect(findCategoryAndUpdate).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findCategoryAndUpdate).rejects.toThrow(
				expect.objectContaining({ code: 'P2025' }),
			);
		});

		it('should return updated category', async () => {
			const updatedCategory = await categoryService.findCategoryAndUpdate(
				category.id,
				data,
			);

			expect(updatedCategory).toEqual(
				expect.objectContaining({
					...data,
					id: category.id,
				}),
			);
		});
	});

	describe('findCategoryAndDelete', () => {
		let category: Category;

		beforeEach(async () => {
			category = await categoryFactory.create();
		});

		it('should throw not found error', async () => {
			const id = 0;
			const findCategoryAndDelete = async () => {
				await categoryService.findCategoryAndDelete(id);
			};

			await expect(findCategoryAndDelete).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findCategoryAndDelete).rejects.toThrow(
				expect.objectContaining({ code: 'P2025' }),
			);
		});

		it('should return delete category', async () => {
			const updatedCategory = await categoryService.findCategoryAndDelete(
				category.id,
			);

			expect(updatedCategory).toEqual(
				expect.objectContaining({
					id: category.id,
				}),
			);
		});
	});
});
