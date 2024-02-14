import { PaginationOptions, paginationKeys } from '@lib/pagination';
import { CommentService } from '.';
import commentFactory from '../CommentFactory';
import { Comment, Post, Prisma, Profile, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import userFactory from '@resources/user/UserFactory';
import postFactory from '@resources/post/PostFactory';
import {
	PrismaClientKnownRequestError,
	PrismaClientValidationError,
} from '@prisma/client/runtime/library';

describe('CommentService', () => {
	const commentService = new CommentService();

	describe('findManyComments', () => {
		let count: number;

		beforeEach(async () => {
			({ count } = await commentFactory.createMany(4));
		});

		it('should return paginated comments', async () => {
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

			const results = await commentService.findManyComments<{
				user: User & { profile: Profile };
			}>(options);

			expect(Object.keys(results)).toEqual(
				expect.arrayContaining(paginationKeys),
			);
			expect(results.data).toHaveLength(options.pageSize);
			expect(results.totalCount).toBe(count);
			expect(results.data).toEqual(
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

	describe('createComment', () => {
		let data = {
			body: faker.lorem.sentence(),
		} as unknown as Prisma.CommentCreateInput;
		let post: Post;
		let user: User;

		beforeEach(async () => {
			user = await userFactory.create();
			post = await postFactory.create();
			data = {
				...data,
				user: { connect: { id: user.id } },
				post: { connect: { id: post.id } },
			};
		});

		it('should throw validation error', async () => {
			const createComment = async () => {
				// @ts-ignore
				await commentService.createComment({});
			};

			await expect(createComment).rejects.toBeInstanceOf(
				PrismaClientValidationError,
			);
		});

		it('should return comment', async () => {
			const comment = await commentService.createComment(data, {
				include: {
					user: {
						include: {
							profile: true,
						},
					},
				},
			});

			expect(comment).toEqual(
				expect.objectContaining({
					id: expect.any(Number),
					body: data.body,
					user: expect.objectContaining({
						id: user.id,
						profile: expect.objectContaining({
							id: expect.any(Number),
						}),
					}),
					postId: post.id,
				}),
			);
		});
	});

	describe('findCommentById', () => {
		let comment: Comment;

		beforeEach(async () => {
			comment = await commentFactory.create();
		});

		it('should throw not found error', async () => {
			const id = 0;
			const findCommentById = async () => {
				await commentService.findCommentById(id);
			};

			await expect(findCommentById).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findCommentById).rejects.toThrow(
				expect.objectContaining({ code: 'P2025' }),
			);
		});

		it('should return comment', async () => {
			const foundComment = await commentService.findCommentById(comment.id, {
				include: { user: { include: { profile: true } } },
			});

			expect(foundComment).toEqual(
				expect.objectContaining({
					id: comment.id,
					user: expect.objectContaining({
						id: expect.any(Number),
						profile: expect.objectContaining({
							id: expect.any(Number),
						}),
					}),
				}),
			);
		});
	});

	describe('findCommentAndUpdate', () => {
		let comment: Comment;
		const data = {
			body: faker.lorem.sentence(),
		};

		beforeEach(async () => {
			comment = await commentFactory.create();
		});

		it('should throw not found error', async () => {
			const id = 0;
			const findCommentAndUpdate = async () => {
				await commentService.findCommentAndUpdate(id, data);
			};

			await expect(findCommentAndUpdate).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findCommentAndUpdate).rejects.toThrow(
				expect.objectContaining({ code: 'P2025' }),
			);
		});

		it('should return updated comment', async () => {
			const updatedComment = await commentService.findCommentAndUpdate(
				comment.id,
				data,
				{
					include: { user: { include: { profile: true } } },
				},
			);

			expect(updatedComment).toEqual(
				expect.objectContaining({
					id: comment.id,
					...data,
					user: expect.objectContaining({
						id: expect.any(Number),
						profile: expect.objectContaining({
							id: expect.any(Number),
						}),
					}),
				}),
			);
		});
	});

	describe('findCommentAndDelete', () => {
		let comment: Comment;

		beforeEach(async () => {
			comment = await commentFactory.create();
		});

		it('should throw not found error', async () => {
			const id = 0;
			const findCommentAndUpdate = async () => {
				await commentService.findCommentAndDelete(id);
			};

			await expect(findCommentAndUpdate).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findCommentAndUpdate).rejects.toThrow(
				expect.objectContaining({ code: 'P2025' }),
			);
		});

		it('should return updated comment', async () => {
			const updatedComment = await commentService.findCommentAndDelete(
				comment.id,
			);

			expect(updatedComment).toEqual(
				expect.objectContaining({
					id: comment.id,
				}),
			);
		});
	});
});
