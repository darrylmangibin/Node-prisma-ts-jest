import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { hashPassword } from '.';

describe('hashPassword', () => {
	it('should hash the password', async () => {
		const password = faker.internet.password();

		const hashedPassword = await hashPassword(password);

		expect(typeof hashedPassword).toBe('string');
		expect(
			await bcrypt.compare(faker.internet.password(), hashedPassword),
		).toBeFalsy();
		expect(await bcrypt.compare(password, hashedPassword)).toBeTruthy();
	});
});
