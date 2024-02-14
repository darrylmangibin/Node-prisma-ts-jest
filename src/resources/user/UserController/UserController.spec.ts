import { Prisma, User } from '@prisma/client';
import userFactory from '../UserFactory';
import { prisma } from '@lib/prisma';
import { faker } from '@faker-js/faker';
import supertest from 'supertest';
import { app } from '@main/server';
import { setBearerToken } from '@lib/setBearerToken';
import { PaginationOptions, paginationKeys } from '@lib/pagination';

describe('UserController', () => {
	const userEndpoint = '/api/users';
	let signIn: AppSignIn;

	beforeEach(async () => {
		signIn = await appSignIn();
	});

	describe(`findManyUsers GET ${userEndpoint}`, () => {
		let users: User[];

		beforeEach(async () => {
			users = await userFactory.createMany(4, {
				query: { where: { NOT: { id: signIn.user.id } } },
			});
		});

		it('should return 200 success response', async () => {
			const options = {
				pageNumber: 1,
				pageSize: 2,
				query: {
					include: {
						profile: true,
					},
				},
			} satisfies PaginationOptions<Prisma.UserFindManyArgs>;

			const res = await supertest(app)
				.get(userEndpoint)
				.set(setBearerToken(signIn.token))
				.query(options);

			expect(Object.keys(res.body)).toEqual(
				expect.arrayContaining(paginationKeys),
			);
			expect(res.body.data).toHaveLength(options.pageSize);
			expect(res.body.totalCount).toBe(users.length);
			expect(res.body.data).toEqual(
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

	describe(`findUserById GET ${userEndpoint}/:userId`, () => {
		let user: User;

		beforeEach(async () => {
			user = await userFactory.create();
		});

		it('should return 404 error response', async () => {
			const id = 0;

			const res = await supertest(app)
				.get(`${userEndpoint}/${id}`)
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
				.get(`${userEndpoint}/${user.id}`)
				.set(setBearerToken(signIn.token))
				.query({
					query: {
						include: {
							profile: true,
						},
					},
				});

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: user.id,
					profile: expect.objectContaining({
						id: expect.any(Number),
					}),
				}),
			);
		});
	});

	describe(`findUserAndUpdate PUT ${userEndpoint}/:userId`, () => {
		let user: User;
		const data = {
			name: faker.person.fullName(),
			email: faker.internet.email(),
			role: 'admin',
			age: faker.number.int({ max: 100 }),
			address: faker.location.streetAddress(),
		};

		beforeEach(async () => {
			user = await userFactory.create();
		});

		it('should return 403 error response', async () => {
			const res = await supertest(app)
				.put(`${userEndpoint}/${user.id}`)
				.set(setBearerToken(signIn.token))
				.send(data);

			expect(res.status).toBe(403);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Forbidden',
				}),
			);
		});

		it('should return 422 error response', async () => {
			const admin = await appSignIn({ role: 'admin' });

			const res = await supertest(app)
				.put(`${userEndpoint}/${user.id}`)
				.set(setBearerToken(admin.token))
				.send({});

			expect(res.status).toBe(422);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unprocessable entity',
					error: expect.objectContaining({
						name: expect.any(String),
						email: expect.any(String),
						role: expect.any(String),
						age: expect.any(String),
						address: expect.any(String),
					}),
				}),
			);
		});

		it('should return 404 success response', async () => {
			const admin = await appSignIn({ role: 'admin' });
			const id = 0;

			const res = await supertest(app)
				.put(`${userEndpoint}/${id}`)
				.set(setBearerToken(admin.token))
				.send(data);

			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Not found',
				}),
			);
		});

		it('should return 200 success response', async () => {
			const admin = await appSignIn({ role: 'admin' });

			const res = await supertest(app)
				.put(`${userEndpoint}/${user.id}`)
				.set(setBearerToken(admin.token))
				.send(data);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: user.id,
					name: data.name,
					role: data.role,
					email: data.email,
					profile: expect.objectContaining({
						id: expect.any(Number),
						age: data.age,
						address: data.address,
					}),
				}),
			);
		});
	});

	describe(`findUserAndDelete DELETE ${userEndpoint}/:userId`, () => {
		let user: User;

		beforeEach(async () => {
			user = await userFactory.create();
		});

		it('should return 403 error response', async () => {
			const res = await supertest(app)
				.delete(`${userEndpoint}/${user.id}`)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(403);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Forbidden',
				}),
			);
		});

		it('should return 404 success response', async () => {
			const admin = await appSignIn({ role: 'admin' });
			const id = 0;

			const res = await supertest(app)
				.delete(`${userEndpoint}/${id}`)
				.set(setBearerToken(admin.token));

			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Not found',
				}),
			);
		});

		it('should return 200 success response', async () => {
			const admin = await appSignIn({ role: 'admin' });

			const res = await supertest(app)
				.delete(`${userEndpoint}/${user.id}`)
				.set(setBearerToken(admin.token));

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: user.id,
				}),
			);
		});
	});
});
