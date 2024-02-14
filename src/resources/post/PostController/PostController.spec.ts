import supertest from 'supertest';
import postFactory from '../PostFactory';
import { app } from '@main/server';
import { setBearerToken } from '@lib/setBearerToken';
import { PaginationOptions, paginationKeys } from '@lib/pagination';
import { Post, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('PostController', () => {
	const postEndpoint = '/api/posts';
	let signIn: AppSignIn;

	beforeEach(async () => {
		signIn = await appSignIn();
	});

	describe(`findManyPosts GET ${postEndpoint}`, () => {
		let count: number;

		beforeEach(async () => {
			({ count } = await postFactory.createMany(4));
		});

		it('should return 200 success response', async () => {
			const options = {
				pageNumber: 1,
				pageSize: 2,
				query: {
					include: {
						user: {
							include: {
								profile: true,
							},
						},
					},
				},
			} satisfies PaginationOptions<Prisma.PostFindManyArgs>;

			const res = await supertest(app)
				.get(postEndpoint)
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
						title: expect.any(String),
						details: expect.any(String),
						user: expect.objectContaining({
							id: expect.any(Number),
							profile: expect.objectContaining({
								id: expect.any(Number),
							}),
						}),
					}),
				]),
			);
		});
	});

	describe(`findPostById GET ${postEndpoint}/:postId`, () => {
		let post: Post;

		beforeEach(async () => {
			post = await postFactory.create();
		});

		it('should return 404 error response', async () => {
			const id = 0;

			const res = await supertest(app)
				.get(`${postEndpoint}/${id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Not found',
				}),
			);
		});

		it('should return 200 success response', async () => {
			const query = {
				include: {
					user: true,
				},
			};

			const res = await supertest(app)
				.get(`${postEndpoint}/${post.id}`)
				.set(setBearerToken(signIn.token))
				.query(query);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: post.id,
					user: expect.objectContaining({
						id: expect.any(Number),
					}),
				}),
			);
		});
	});

	describe(`createPost POST ${postEndpoint}`, () => {
		const body = {
			title: faker.lorem.sentence(),
			details: faker.lorem.paragraph(),
		};

		it('should return 422 error response', async () => {
			const res = await supertest(app)
				.post(postEndpoint)
				.set(setBearerToken(signIn.token))
				.send({});

			expect(res.status).toBe(422);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unprocessable entity',
					error: expect.objectContaining({
						title: expect.any(String),
						details: expect.any(String),
					}),
				}),
			);
		});

		it('should return 201 success response', async () => {
			const res = await supertest(app)
				.post(postEndpoint)
				.set(setBearerToken(signIn.token))
				.send(body);

			expect(res.status).toBe(201);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: expect.any(Number),
					...body,
					user: expect.objectContaining({
						id: signIn.user.id,
					}),
				}),
			);
		});
	});

	describe(`findPostAndUpdate PUT ${postEndpoint}/:postId`, () => {
		let post: Post;
		const body = {
			title: faker.lorem.sentence(),
			details: faker.lorem.paragraph(),
		};

		beforeEach(async () => {
			post = await postFactory.create({
				user: { connect: { id: signIn.user.id } },
			});
		});

		it('should return 422 error response', async () => {
			const res = await supertest(app)
				.put(`${postEndpoint}/${post.id}`)
				.set(setBearerToken(signIn.token))
				.send({});

			expect(res.status).toBe(422);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unprocessable entity',
					error: expect.objectContaining({
						title: expect.any(String),
						details: expect.any(String),
					}),
				}),
			);
		});

		it('should return 404 error response', async () => {
			const id = 0;
			const res = await supertest(app)
				.put(`${postEndpoint}/${id}`)
				.set(setBearerToken(signIn.token))
				.send(body);

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
				.put(`${postEndpoint}/${post.id}`)
				.set(setBearerToken(otherUser.token))
				.send(body);

			expect(res.status).toBe(403);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Forbidden',
				}),
			);
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.put(`${postEndpoint}/${post.id}`)
				.set(setBearerToken(signIn.token))
				.send(body)
				.query({
					include: {
						user: true,
					},
				});

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: post.id,
					...body,
					user: expect.objectContaining({
						id: expect.any(Number),
					}),
				}),
			);
		});
	});

	describe(`findPostAndDelete DELETE ${postEndpoint}/:postId`, () => {
		let post: Post;

		beforeEach(async () => {
			post = await postFactory.create({
				user: { connect: { id: signIn.user.id } },
			});
		});

		it('should return 404 error response', async () => {
			const id = 0;
			const res = await supertest(app)
				.delete(`${postEndpoint}/${id}`)
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
				.delete(`${postEndpoint}/${post.id}`)
				.set(setBearerToken(otherUser.token));

			expect(res.status).toBe(403);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Forbidden',
				}),
			);
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.delete(`${postEndpoint}/${post.id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: post.id,
				}),
			);
		});
	});
});
