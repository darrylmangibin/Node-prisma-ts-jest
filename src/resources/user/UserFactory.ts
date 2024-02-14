import { faker } from '@faker-js/faker';
import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client';

export class UserFactory {
	public async create(body?: Partial<Prisma.UserCreateInput>) {
		return await prisma.user.create({
			data: {
				email: body?.email || faker.internet.email(),
				name: body?.name || faker.person.fullName(),
				password: body?.password || faker.internet.password(),
				role: body?.role || 'user',
				profile: body?.profile || {
					create: {
						address: faker.location.streetAddress(),
						age: faker.number.int({ max: 100 }),
					},
				},
			},
			include: {
				profile: true,
			},
		});
	}

	public async createMany(
		count: number = 1,
		body?: Partial<Prisma.UserCreateInput> & {
			query?: Prisma.UserFindManyArgs;
		},
	) {
		const data: Prisma.UserCreateInput[] = [];

		for await (let _k of Array.from({ length: count })) {
			data.push({
				email: body?.email || faker.internet.email(),
				name: body?.name || faker.person.fullName(),
				password: body?.password || faker.internet.password(),
				role: body?.role || 'user',
			});
		}

		return await prisma.$transaction(async ($prisma) => {
			await $prisma.user.createMany({ data });
			const users = await $prisma.user.findMany(body?.query);

			for await (let user of users) {
				await $prisma.profile.create({
					data: {
						address: faker.location.streetAddress(),
						age: faker.number.int({ max: 100 }),
						user: { connect: { id: user.id } },
					},
				});
			}

			return users;
		});
	}

	public async deleteMany() {
		await prisma.user.deleteMany();
	}
}

const userFactory = new UserFactory();

export default userFactory;
