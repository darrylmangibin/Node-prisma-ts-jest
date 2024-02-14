import { PaginationOptions, paginationKeys } from '@lib/pagination';
import { PostService } from '.';
import { Category, Comment, Post, Prisma, Profile, User } from '@prisma/client';
import postFactory from '../PostFactory';
import {
	PrismaClientKnownRequestError,
	PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { faker } from '@faker-js/faker';
import userFactory from '@resources/user/UserFactory';
import commentFactory from '@resources/comment/CommentFactory';
import { prisma } from '@lib/prisma';
import categoryFactory from '@resources/category/CategoryFactory';

describe('PostService', () => {
	const postService = new PostService();

	describe('findManyPosts', () => {
		let count: number;

		beforeEach(async () => {
			({ count } = await postFactory.createMany(4));
		});

		it('should return paginated posts', async () => {
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

			const results = await postService.findManyPosts<{
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

		it('should return paginated posts with its category', async () => {
			const category = await categoryFactory.create();
			const createPosts = async () => {
				return [
					await postFactory.create({
						categories: { create: { categoryId: category.id } },
					}),
					await postFactory.create({
						categories: { create: { categoryId: category.id } },
					}),
					await postFactory.create({
						categories: { create: { categoryId: category.id } },
					}),
				];
			};
			const posts = await createPosts();
			const options = {
				pageNumber: 1,
				pageSize: 2,
				query: {
					where: {
						categories: {
							some: {
								categoryId: {
									in: [category.id],
								},
							},
						},
					},
					include: {
						user: {
							include: {
								profile: true,
							},
						},
					},
				},
			} satisfies PaginationOptions<Prisma.PostFindManyArgs>;

			const results = await postService.findManyPosts<{
				user: User & { profile: Profile };
			}>(options);

			expect(Object.keys(results)).toEqual(
				expect.arrayContaining(paginationKeys),
			);
			expect(results.data).toHaveLength(options.pageSize);
			expect(results.totalCount).toBe(posts.length);
			expect(results.data).toEqual(
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

	describe('findPostById', () => {
		let post: Post;

		beforeEach(async () => {
			post = await postFactory.create();
		});

		it('should throw not found error', async () => {
			const id = 0;
			const findPostById = async () => {
				await postService.findPostById(id);
			};

			await expect(findPostById).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findPostById).rejects.toThrow(
				expect.objectContaining({
					code: 'P2025',
				}),
			);
		});

		it('should return post', async () => {
			const foundPost = await postService.findPostById(post.id, {
				include: { user: true },
			});

			expect(foundPost).toEqual(
				expect.objectContaining({
					id: post.id,
					user: expect.objectContaining({
						id: expect.any(Number),
					}),
				}),
			);
		});
	});

	describe('createPost', () => {
		let user: User;
		let category: Category;
		let body = {
			title: faker.lorem.sentence(),
			details: faker.lorem.paragraph(),
			user: {},
			categories: {},
		} satisfies Prisma.PostCreateInput;

		beforeEach(async () => {
			user = await userFactory.create();
			category = await categoryFactory.create();
			body = {
				...body,
				user: { connect: { id: user.id } },
				categories: {
					create: [
						{
							categoryId: category.id,
						},
					],
				},
			} satisfies Prisma.PostCreateInput;
		});

		it('should throw validation error', async () => {
			const createPost = async () => {
				// @ts-ignore
				await postService.createPost({});
			};

			await expect(createPost).rejects.toBeInstanceOf(
				PrismaClientValidationError,
			);
		});

		it('should create post', async () => {
			const post = await postService.createPost<Prisma.PostInclude>(body, {
				include: { user: true, categories: { include: { category: true } } },
			});

			expect(post).toEqual(
				expect.objectContaining({
					id: expect.any(Number),
					...body,
					user: expect.objectContaining({
						id: user.id,
					}),
					categories: expect.arrayContaining([
						expect.objectContaining({
							category: expect.objectContaining({
								id: category.id,
								name: category.name,
							}),
						}),
					]),
				}),
			);
		});
	});

	describe('findPostAndUpdate', () => {
		const body = {
			title: faker.lorem.paragraph(),
			details: faker.lorem.sentence(),
		};
		let post: Post;

		beforeEach(async () => {
			post = await postFactory.create();
		});

		it('should throw not found', async () => {
			const id = 0;

			const findPostAndUpdate = async () => {
				await postService.findPostAndUpdate(id, {});
			};

			await expect(findPostAndUpdate).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findPostAndUpdate).rejects.toThrow(
				expect.objectContaining({ code: 'P2025' }),
			);
		});

		it('should return updated post', async () => {
			const updatedPost =
				await postService.findPostAndUpdate<Prisma.PostInclude>(post.id, body, {
					include: { user: true },
				});

			expect(updatedPost).toEqual(
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

	describe('findPostAndDelete', () => {
		let post: Post;
		let comment: Comment;

		beforeEach(async () => {
			post = await postFactory.create();
			comment = await commentFactory.create({
				post: { connect: { id: post.id } },
			});
		});

		it('should throw not found', async () => {
			const id = 0;

			const findPostAndDelete = async () => {
				await postService.findPostAndDelete(id);
			};

			await expect(findPostAndDelete).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findPostAndDelete).rejects.toThrow(
				expect.objectContaining({ code: 'P2025' }),
			);
		});

		it('should return deleted post', async () => {
			const otherComment = await commentFactory.create();
			const deletePost = await postService.findPostAndDelete(post.id);

			expect(deletePost).toEqual(
				expect.objectContaining({
					id: post.id,
				}),
			);
			expect(
				await prisma.comment.findFirst({ where: { id: comment.id } }),
			).toBeNull();
			expect(
				await prisma.comment.findFirst({ where: { id: otherComment.id } }),
			).not.toBeNull();
		});
	});
});
