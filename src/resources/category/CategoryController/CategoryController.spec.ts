import { faker } from '@faker-js/faker';
import { setBearerToken } from '@lib/setBearerToken';
import { app } from '@main/server';
import supertest from 'supertest';
import categoryFactory from '../CategoryFactory';
import { PaginationOptions, paginationKeys } from '@lib/pagination';
import { Category, Prisma } from '@prisma/client';

describe('CategoryController', () => {
	let signIn: AppSignIn;
	const categoryEndpoint = '/api/categories';

	beforeEach(async () => {
		signIn = await appSignIn({ role: 'admin' });
	});

	describe(`createCategory POST ${categoryEndpoint}`, () => {
		const data = {
			name: faker.commerce.department(),
		};

		it('should return 403 error response', async () => {
			const otherUser = await appSignIn();

			const res = await supertest(app)
				.post(categoryEndpoint)
				.set(setBearerToken(otherUser.token))
				.send(data);

			expect(res.status).toBe(403);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Forbidden',
				}),
			);
		});

		it('should return 422 error response', async () => {
			const res = await supertest(app)
				.post(categoryEndpoint)
				.set(setBearerToken(signIn.token))
				.send({});

			expect(res.status).toBe(422);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unprocessable entity',
					error: expect.objectContaining({
						name: expect.any(String),
					}),
				}),
			);
		});

		it('should return 201 success response', async () => {
			const res = await supertest(app)
				.post(categoryEndpoint)
				.set(setBearerToken(signIn.token))
				.send(data);

			expect(res.status).toBe(201);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: expect.any(Number),
					...data,
				}),
			);
		});
	});

	describe(`findManyCategories GET ${categoryEndpoint}`, () => {
		let count: number;

		beforeEach(async () => {
			({ count } = await categoryFactory.createMany(4));
		});

		it('should return 200 success response', async () => {
			const options = {
				pageNumber: 1,
				pageSize: 2,
			} satisfies PaginationOptions<Prisma.CategoryFindManyArgs>;
			const res = await supertest(app)
				.get(categoryEndpoint)
				.set(setBearerToken(signIn.token))
				.query(options);

			expect(res.status).toBe(200);
			expect(Object.keys(res.body)).toEqual(
				expect.arrayContaining(paginationKeys),
			);
			expect(res.body.data).toHaveLength(options.pageSize);
			expect(res.body.totalCount).toBe(count);
			expect(res.body.data).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: expect.any(Number),
						name: expect.any(String),
					}),
				]),
			);
		});
	});

	describe(`findCategoryById GET ${categoryEndpoint}/:categoryId`, () => {
		let category: Category;

		beforeEach(async () => {
			category = await categoryFactory.create();
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.get(`${categoryEndpoint}/${category.id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: category.id,
				}),
			);
		});

		it('should return 404 error response', async () => {
			const id = 0;
			const res = await supertest(app)
				.get(`${categoryEndpoint}/${id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Not found',
				}),
			);
		});
	});

	describe(`findCategoryAndUpdate PUT ${categoryEndpoint}/:categoryId`, () => {
		let category: Category;
		const data = {
			name: faker.commerce.department(),
		};

		beforeEach(async () => {
			category = await categoryFactory.create();
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.put(`${categoryEndpoint}/${category.id}`)
				.set(setBearerToken(signIn.token))
				.send(data);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: category.id,
					...data,
				}),
			);
		});

		it('should return 404 error response', async () => {
			const id = 0;
			const res = await supertest(app)
				.put(`${categoryEndpoint}/${id}`)
				.set(setBearerToken(signIn.token))
				.send(data);

			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Not found',
				}),
			);
		});

		it('should return 422 error response', async () => {
			const res = await supertest(app)
				.put(`${categoryEndpoint}/${category.id}`)
				.set(setBearerToken(signIn.token))
				.send({});

			expect(res.status).toBe(422);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unprocessable entity',
					error: expect.objectContaining({
						name: expect.any(String),
					}),
				}),
			);
		});

		it('should return 403 error response', async () => {
			const otherUser = await appSignIn();
			const res = await supertest(app)
				.put(`${categoryEndpoint}/${category.id}`)
				.set(setBearerToken(otherUser.token))
				.send(data);

			expect(res.status).toBe(403);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Forbidden',
				}),
			);
		});
	});

	describe(`findCategoryAndDelete DELETE ${categoryEndpoint}/:categoryId`, () => {
		let category: Category;

		beforeEach(async () => {
			category = await categoryFactory.create();
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.delete(`${categoryEndpoint}/${category.id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: category.id,
				}),
			);
		});

		it('should return 404 error response', async () => {
			const id = 0;
			const res = await supertest(app)
				.delete(`${categoryEndpoint}/${id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Not found',
				}),
			);
		});

		it('should return 403 error response', async () => {
			const otherUser = await appSignIn();
			const res = await supertest(app)
				.delete(`${categoryEndpoint}/${category.id}`)
				.set(setBearerToken(otherUser.token));

			expect(res.status).toBe(403);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Forbidden',
				}),
			);
		});
	});
});
