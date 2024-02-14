import { PaginationOptions, paginationKeys } from '@lib/pagination';
import { setBearerToken } from '@lib/setBearerToken';
import { app } from '@main/server';
import { Comment, Post, Prisma } from '@prisma/client';
import supertest from 'supertest';
import commentFactory from '../CommentFactory';
import postFactory from '@resources/post/PostFactory';
import { faker } from '@faker-js/faker';

describe('CommentController', () => {
	const commentEndpoint = '/api/comments';
	const postEndpoint = '/api/posts';
	let signIn: AppSignIn;

	beforeEach(async () => {
		signIn = await appSignIn();
	});

	describe(`findManyComments GET ${commentEndpoint}`, () => {
		let count: number;

		beforeEach(async () => {
			({ count } = await commentFactory.createMany(4));
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
			} satisfies PaginationOptions<Prisma.CommentFindManyArgs>;
			const res = await supertest(app)
				.get(commentEndpoint)
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
						body: expect.any(String),
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

	describe(`findManyComments GET ${postEndpoint}/:postId/comments`, () => {
		let count: number;
		let post: Post;

		beforeEach(async () => {
			post = await postFactory.create();
			({ count } = await commentFactory.createMany(4, { postId: post.id }));
		});

		it('should return 200 success response', async () => {
			const otherPost = await postFactory.create();
			await commentFactory.create({ post: { connect: { id: otherPost.id } } });
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
			} satisfies PaginationOptions<Prisma.CommentFindManyArgs>;
			const res = await supertest(app)
				.get(`${postEndpoint}/${post.id}/comments`)
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
						body: expect.any(String),
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

	describe(`createComment POST ${postEndpoint}/:postId/comments`, () => {
		const data = {
			body: faker.lorem.sentence(),
		};
		let post: Post;

		beforeEach(async () => {
			post = await postFactory.create();
		});

		it('should return 422 error response', async () => {
			const res = await supertest(app)
				.post(`${postEndpoint}/${post.id}/comments`)
				.set(setBearerToken(signIn.token))
				.send({});

			expect(res.status).toBe(422);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unprocessable entity',
					error: expect.objectContaining({
						body: expect.any(String),
					}),
				}),
			);
		});

		it('should return 400 error response', async () => {
			const id = 0;
			const res = await supertest(app)
				.post(`${postEndpoint}/${id}/comments`)
				.set(setBearerToken(signIn.token))
				.send(data);

			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Not found',
				}),
			);
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.post(`${postEndpoint}/${post.id}/comments`)
				.set(setBearerToken(signIn.token))
				.send(data);

			expect(res.status).toBe(201);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: expect.any(Number),
					postId: post.id,
					userId: signIn.user.id,
					...data,
				}),
			);
		});
	});

	describe(`findCommentById GET ${commentEndpoint}/:commentId`, () => {
		let comment: Comment;

		beforeEach(async () => {
			comment = await commentFactory.create();
		});

		it('should return 404 error response', async () => {
			const id = 0;
			const res = await supertest(app)
				.get(`${commentEndpoint}/${id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Not found',
				}),
			);
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.get(`${commentEndpoint}/${comment.id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: comment.id,
				}),
			);
		});
	});

	describe(`findCommentAndUpdate PUT ${commentEndpoint}/:commentId`, () => {
		let comment: Comment;
		const data = {
			body: faker.lorem.sentence(),
		};

		beforeEach(async () => {
			comment = await commentFactory.create({
				user: { connect: { id: signIn.user.id } },
			});
		});

		it('should return 404 error response', async () => {
			const id = 0;
			const res = await supertest(app)
				.put(`${commentEndpoint}/${id}`)
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
				.put(`${commentEndpoint}/${comment.id}`)
				.set(setBearerToken(signIn.token))
				.send({});

			expect(res.status).toBe(422);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unprocessable entity',
				}),
			);
		});

		it('should return 403 error response', async () => {
			const otherComment = await commentFactory.create();
			const res = await supertest(app)
				.put(`${commentEndpoint}/${otherComment.id}`)
				.set(setBearerToken(signIn.token))
				.send(data);

			expect(res.status).toBe(403);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Forbidden',
				}),
			);
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.put(`${commentEndpoint}/${comment.id}`)
				.set(setBearerToken(signIn.token))
				.send(data)
				.query({
					include: {
						user: {
							include: {
								profile: true,
							},
						},
					},
				});

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: comment.id,
					...data,
					user: expect.objectContaining({
						id: signIn.user.id,
						profile: expect.objectContaining({
							id: expect.any(Number),
						}),
					}),
				}),
			);
		});
	});

	describe(`findCommentAndDelete DELETE ${commentEndpoint}/:commentId`, () => {
		let comment: Comment;

		beforeEach(async () => {
			comment = await commentFactory.create({
				user: { connect: { id: signIn.user.id } },
			});
		});

		it('should return 404 error response', async () => {
			const id = 0;
			const res = await supertest(app)
				.delete(`${commentEndpoint}/${id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Not found',
				}),
			);
		});

		it('should return 403 error response', async () => {
			const otherComment = await commentFactory.create();
			const res = await supertest(app)
				.delete(`${commentEndpoint}/${otherComment.id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(403);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Forbidden',
				}),
			);
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.delete(`${commentEndpoint}/${comment.id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: comment.id,
				}),
			);
		});
	});
});
