import { faker } from '@faker-js/faker';
import { AuthService } from '.';
import userFactory from '@resources/user/UserFactory';
import { User } from '@prisma/client';
import { verifyToken } from '@lib/verifyToken';
import { comparePassword } from '@lib/comparePassword';

describe('AuthService', () => {
	const authService = new AuthService();

	describe('login', () => {
		const password = faker.internet.password();
		let user: User;

		beforeEach(async () => {
			user = await userFactory.create({ password });
		});

		it('should return error when no email found', async () => {
			const login = async () => {
				await authService.login({ email: faker.internet.email(), password });
			};

			await expect(login).rejects.toThrow(
				expect.objectContaining({
					message: 'Unauthorized',
					error: expect.objectContaining({ message: 'Invalid credentials' }),
				}),
			);
		});

		it('should return error when password mismatch', async () => {
			const login = async () => {
				await authService.login({
					email: user.email,
					password: faker.internet.password(),
				});
			};

			await expect(login).rejects.toThrow(
				expect.objectContaining({
					message: 'Unauthorized',
					error: expect.objectContaining({ message: 'Invalid credentials' }),
				}),
			);
		});

		it('should return token', async () => {
			const token = await authService.login({
				email: user.email,
				password,
			});

			expect(verifyToken(token)).toEqual(
				expect.objectContaining({ id: user.id }),
			);
		});
	});

	describe('changePassword', () => {
		let user: User;
		const password = faker.internet.password();
		const newPassword = faker.internet.password();

		beforeEach(async () => {
			user = await userFactory.create({ password });
		});

		it('should throw error when password incorrect', async () => {
			const otherPassword = faker.internet.password();

			const changePassword = async () => {
				await authService.changePassword(user.id, {
					newPassword,
					currentPassword: otherPassword,
				});
			};

			await expect(changePassword).rejects.toThrow(
				expect.objectContaining({
					message: 'Unauthorized',
					error: expect.objectContaining({ message: 'Password incorrect' }),
				}),
			);
		});

		it('should update the password', async () => {
			const updatedUser = await authService.changePassword(user.id, {
				newPassword,
				currentPassword: password,
			});

			expect(updatedUser).toEqual(
				expect.objectContaining({
					id: user.id,
					password: expect.any(String),
				}),
			);
			expect(await comparePassword(password, updatedUser.password)).toBeFalsy();
			expect(
				await comparePassword(newPassword, updatedUser.password),
			).toBeTruthy();
		});
	});
});
