import { faker } from '@faker-js/faker';
import { UserService } from '.';
import {
	PrismaClientKnownRequestError,
	PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import userFactory from '../UserFactory';
import * as password from '@lib/hashPassword';
import { Prisma, Profile, User } from '@prisma/client';
import { prisma } from '@lib/prisma';
import { PaginationOptions, paginationKeys } from '@lib/pagination';
import postFactory from '@resources/post/PostFactory';
import commentFactory from '@resources/comment/CommentFactory';

describe('UserService', () => {
	const userService = new UserService();

	describe('create', () => {
		const createBody = {
			userData: {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				password: faker.internet.password(),
			},
			profileData: {
				address: faker.location.streetAddress(),
				age: faker.number.int({ max: 100 }),
			},
		};

		it('should throw validation error', async () => {
			const create = async () => {
				await userService.create({
					userData: {
						name: faker.person.fullName(),
						email: faker.internet.email(),
						password: faker.internet.password(),
					},
					// @ts-ignore
					profileData: {
						address: faker.location.streetAddress(),
					},
				});
			};

			await expect(create).rejects.toBeInstanceOf(PrismaClientValidationError);
		});

		it('should throw error when email already exists', async () => {
			const user = await userFactory.create();

			const create = async () => {
				await userService.create({
					...createBody,
					userData: {
						...createBody.userData,
						email: user.email,
					},
				});
			};

			await expect(create).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(create).rejects.toThrow(
				expect.objectContaining({
					code: 'P2002',
				}),
			);
		});

		it('should create user', async () => {
			const hashPasswordSpy = jest.spyOn(password, 'hashPassword');
			const user = await userService.create(createBody);

			expect(user).toEqual(
				expect.objectContaining({
					...createBody.userData,
					id: expect.any(Number),
					password: expect.any(String),
					profile: expect.objectContaining({
						...createBody.profileData,
						id: expect.any(Number),
					}),
				}),
			);
			expect(hashPasswordSpy).toHaveBeenCalledWith(
				createBody.userData.password,
			);
		});
	});

	describe('findUserById', () => {
		let user: User;
		const profile = {
			address: faker.location.streetAddress(),
			age: faker.number.int({ max: 100 }),
		};

		beforeEach(async () => {
			user = await userFactory.create({
				profile: {
					create: profile,
				},
			});
		});

		it('should throw not found error', async () => {
			const id = 0;

			const findUserById = async () => {
				await userService.findUserById(id);
			};

			await expect(findUserById).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findUserById).rejects.toThrow(
				expect.objectContaining({ code: 'P2025' }),
			);
		});

		it('should return user', async () => {
			const foundUser = await userService.findUserById(user.id, {
				include: { profile: true },
			});

			expect(foundUser).toEqual(
				expect.objectContaining({
					id: user.id,
					name: user.name,
					email: user.email,
					profile: expect.objectContaining({
						...profile,
					}),
				}),
			);
		});
	});

	describe('findUserAndUpdate', () => {
		const updateBody = {
			name: faker.person.fullName(),
			email: faker.internet.email(),
			profile: {
				update: {
					address: faker.location.streetAddress(),
					age: faker.number.int({ max: 100 }),
				},
			},
		} satisfies Prisma.UserUpdateInput;
		let user: Awaited<ReturnType<typeof userFactory.create>>;

		beforeEach(async () => {
			user = await userFactory.create();
		});

		it('should throw not found error', async () => {
			const id = 0;
			const findUserAndUpdate = async () => {
				await userService.findUserAndUpdate(id, updateBody);
			};

			await expect(findUserAndUpdate).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findUserAndUpdate).rejects.toThrow(
				expect.objectContaining({ code: 'P2025' }),
			);
		});

		it('should update user', async () => {
			const updatedUser = await userService.findUserAndUpdate(
				user.id,
				updateBody,
				{
					include: {
						profile: true,
					},
				},
			);

			expect(updatedUser).toEqual(
				expect.objectContaining({
					name: updateBody.name,
					email: updateBody.email,
					profile: expect.objectContaining({
						age: updateBody.profile.update.age,
						address: updateBody.profile.update.address,
					}),
				}),
			);
		});
	});

	describe('findUserAndDelete', () => {
		let user: User & { profile?: Profile | null };

		beforeEach(async () => {
			user = await userFactory.create();
		});

		it('should throw not found error', async () => {
			const id = 0;
			const findUserAndDelete = async () => {
				await userService.findUserAndDelete(id);
			};

			await expect(findUserAndDelete).rejects.toBeInstanceOf(
				PrismaClientKnownRequestError,
			);
			await expect(findUserAndDelete).rejects.toThrow(
				expect.objectContaining({ code: 'P2025' }),
			);
		});

		it('should delete user', async () => {
			const post = await postFactory.create({
				user: { connect: { id: user.id } },
			});
			const comment = await commentFactory.create({
				user: { connect: { id: user.id } },
			});
			const otherPost = await postFactory.create();
			const otherComment = await commentFactory.create();
			expect(
				await prisma.profile.findFirst({ where: { id: user.profile?.id } }),
			).not.toBeNull();

			const deletedUser = await userService.findUserAndDelete(user.id);

			expect(deletedUser).toEqual(
				expect.objectContaining({
					id: user.id,
				}),
			);
			expect(
				await prisma.profile.findFirst({ where: { id: user.profile?.id } }),
			).toBeNull();
			expect(
				await prisma.post.findFirst({ where: { id: post.id } }),
			).toBeNull();
			expect(
				await prisma.comment.findFirst({ where: { id: comment.id } }),
			).toBeNull();
			expect(
				await prisma.post.findFirst({ where: { id: otherPost.id } }),
			).not.toBeNull();
			expect(
				await prisma.comment.findFirst({ where: { id: otherComment.id } }),
			).not.toBeNull();
		});
	});

	describe('findManyUsers', () => {
		let users: User[];

		beforeEach(async () => {
			users = await userFactory.createMany(4);
		});

		it('should return paginated users', async () => {
			const options = {
				pageNumber: 1,
				pageSize: 2,
				query: {
					include: {
						profile: true,
					},
				},
			} satisfies PaginationOptions<Prisma.UserFindManyArgs>;

			const results = await userService.findManyUsers<{ profile: Profile }>(
				options,
			);

			expect(Object.keys(results)).toEqual(
				expect.arrayContaining(paginationKeys),
			);
			expect(results.data).toHaveLength(options.pageSize);
			expect(results.totalCount).toBe(users.length);
			expect(results.data).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: expect.any(Number),
						name: expect.any(String),
						email: expect.any(String),
						profile: expect.objectContaining({
							id: expect.any(Number),
						}),
					}),
				]),
			);
		});
	});
});
