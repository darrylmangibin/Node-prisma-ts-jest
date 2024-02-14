import { faker } from '@faker-js/faker';
import { prisma } from '@lib/prisma';
import { Prisma, User } from '@prisma/client';
import userFactory from '@resources/user/UserFactory';

export class PostFactory {
	public async create(body?: Partial<Prisma.PostCreateInput>) {
		return await prisma.post.create({
			data: {
				...body,
				details: body?.details || faker.lorem.paragraph(),
				title: body?.title || faker.lorem.sentence(),
				user: body?.user || {
					connect: await userFactory.create(),
				},
			},
		});
	}

	public async createMany(
		count: number = 1,
		args?: Partial<Prisma.PostCreateManyInput>,
	) {
		let data: Prisma.PostCreateManyInput[] = [];

		for await (let _k of Array.from({ length: count })) {
			data.push({
				details: args?.details || faker.lorem.paragraph(),
				title: args?.title || faker.lorem.sentence(),
				userId: args?.userId || (await userFactory.create()).id,
			});
		}

		return prisma.$transaction(async ($prisma) => {
			return await $prisma.post.createMany({ data });
		});
	}

	public async deleteMany() {
		return await prisma.post.deleteMany();
	}
}

const postFactory = new PostFactory();

export default postFactory;
