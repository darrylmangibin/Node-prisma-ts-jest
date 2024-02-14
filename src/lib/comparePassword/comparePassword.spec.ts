import { faker } from '@faker-js/faker';
import { hashPassword } from '@lib/hashPassword';
import { comparePassword } from '.';

describe('comparePassword', () => {
	const password = faker.internet.password();

	it('should return false when password incorrect', async () => {
		const hashedPassword = await hashPassword(password);

		expect(
			await comparePassword(faker.internet.password(), hashedPassword),
		).toBeFalsy();
	});

	it('should return false when password incorrect', async () => {
		const hashedPassword = await hashPassword(password);

		expect(await comparePassword(password, hashedPassword)).toBeTruthy();
	});
});
