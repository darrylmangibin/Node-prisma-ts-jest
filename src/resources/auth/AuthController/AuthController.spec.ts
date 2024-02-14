import { faker } from '@faker-js/faker';
import { comparePassword } from '@lib/comparePassword';
import { setBearerToken } from '@lib/setBearerToken';
import { app } from '@main/server';
import { User } from '@prisma/client';
import userFactory from '@resources/user/UserFactory';
import supertest from 'supertest';

describe('AuthController', () => {
	const registerEndpoint = '/api/auth/register';
	const loginEndpoint = '/api/auth/login';
	const profileEndpoint = '/api/auth/profile';
	const changePasswordEndpoint = '/api/auth/change-password';

	describe(`register POST ${registerEndpoint}`, () => {
		const registerData = {
			userData: {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				password: faker.internet.password(),
			},
			profileData: {
				age: faker.number.int({ max: 100 }),
				address: faker.location.streetAddress(),
			},
		};

		it('should return 422 error response', async () => {
			const res = await supertest(app).post(registerEndpoint).send({
				userData: {},
				profileData: {},
			});

			expect(res.status).toBe(422);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unprocessable entity',
					error: expect.objectContaining({
						name: expect.any(String),
						email: expect.any(String),
						password: expect.any(String),
						age: expect.any(String),
						address: expect.any(String),
					}),
				}),
			);
		});

		it('should return 400 error response', async () => {
			const user = await userFactory.create();

			const res = await supertest(app)
				.post(registerEndpoint)
				.send({
					userData: {
						...registerData.userData,
						email: user.email,
					},
					profileData: {
						...registerData.profileData,
					},
				});

			expect(res.status).toBe(400);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Bad request',
					error: expect.objectContaining({
						email: 'Already exists',
					}),
				}),
			);
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.post(registerEndpoint)
				.send(registerData);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({ token: expect.any(String) }),
			);
		});
	});

	describe(`login POST ${loginEndpoint}`, () => {
		const password = faker.internet.password();
		let user: User;

		beforeEach(async () => {
			user = await userFactory.create({ password });
		});

		it('should return 422 error response', async () => {
			const res = await supertest(app).post(loginEndpoint).send({});

			expect(res.status).toBe(422);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unprocessable entity',
					error: expect.objectContaining({
						email: expect.any(String),
						password: expect.any(String),
					}),
				}),
			);
		});

		it('should return 401 error response', async () => {
			const res = await supertest(app).post(loginEndpoint).send({
				email: user.email,
				password: faker.internet.password(),
			});

			expect(res.status).toBe(401);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unauthorized',
					error: expect.objectContaining({
						message: 'Invalid credentials',
					}),
				}),
			);
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app).post(loginEndpoint).send({
				email: user.email,
				password,
			});

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({ token: expect.any(String) }),
			);
		});
	});

	describe(`getProfile GET ${profileEndpoint}`, () => {
		let signIn: AppSignIn;

		beforeEach(async () => {
			signIn = await appSignIn();
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.get(profileEndpoint)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: signIn.user.id,
					name: signIn.user.name,
					email: signIn.user.email,
				}),
			);
		});
	});

	describe(`updateProfile PUT ${profileEndpoint}`, () => {
		let signIn: AppSignIn;
		const updateBody = {
			name: faker.person.fullName(),
			email: faker.internet.email(),
			age: faker.number.int({ max: 100 }),
			address: faker.location.streetAddress(),
		};

		beforeEach(async () => {
			signIn = await appSignIn();
		});

		it('should return 422 error response', async () => {
			const res = await supertest(app)
				.put(profileEndpoint)
				.set(setBearerToken(signIn.token))
				.send({});

			expect(res.status).toBe(422);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unprocessable entity',
					error: expect.objectContaining({
						name: expect.any(String),
						email: expect.any(String),
						age: expect.any(String),
						address: expect.any(String),
					}),
				}),
			);
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.put(profileEndpoint)
				.set(setBearerToken(signIn.token))
				.send(updateBody);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: signIn.user.id,
					name: updateBody.name,
					email: updateBody.email,
					profile: expect.objectContaining({
						age: updateBody.age,
						address: updateBody.address,
					}),
				}),
			);
		});
	});

	describe(`deleteProfile DELETE ${profileEndpoint}`, () => {
		let signIn: AppSignIn;

		beforeEach(async () => {
			signIn = await appSignIn();
		});

		it('should return 200 success response', async () => {
			const res = await supertest(app)
				.delete(profileEndpoint)
				.set(setBearerToken(signIn.token));

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: signIn.user.id,
				}),
			);
		});
	});

	describe(`changePassword PUT ${changePasswordEndpoint}`, () => {
		const password = faker.internet.password();
		let signIn: AppSignIn;

		beforeEach(async () => {
			signIn = await appSignIn({ password });
		});

		it('should return 422 error response', async () => {
			const res = await supertest(app)
				.put(changePasswordEndpoint)
				.set(setBearerToken(signIn.token))
				.send({});

			expect(res.status).toBe(422);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unprocessable entity',
					error: expect.objectContaining({
						currentPassword: expect.any(String),
						newPassword: expect.any(String),
					}),
				}),
			);
		});

		it('should return 401 error response', async () => {
			const res = await supertest(app)
				.put(changePasswordEndpoint)
				.set(setBearerToken(signIn.token))
				.send({
					currentPassword: faker.internet.password(),
					newPassword: faker.internet.password(),
				});

			expect(res.status).toBe(401);
			expect(res.body).toEqual(
				expect.objectContaining({
					message: 'Unauthorized',
					error: expect.objectContaining({
						message: 'Password incorrect',
					}),
				}),
			);
		});

		it('should return 200 success response', async () => {
			const newPassword = faker.internet.password();
			const res = await supertest(app)
				.put(changePasswordEndpoint)
				.set(setBearerToken(signIn.token))
				.send({
					currentPassword: password,
					newPassword,
				});

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					id: signIn.user.id,
				}),
			);
			expect(
				await comparePassword(newPassword, res.body.password),
			).toBeTruthy();
		});
	});
});
