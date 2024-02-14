import { faker } from '@faker-js/faker';
import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client';
import postFactory from '@resources/post/PostFactory';
import userFactory from '@resources/user/UserFactory';

export class CommentFactory {
	public async create(data?: Partial<Prisma.CommentCreateInput>) {
		return await prisma.comment.create({
			data: {
				body: data?.body || faker.lorem.sentence(),
				post: data?.post || {
					connect: { id: (await postFactory.create()).id },
				},
				user: data?.user || {
					connect: { id: (await userFactory.create()).id },
				},
			},
		});
	}

	public async createMany(
		count: number = 1,
		args?: Partial<Prisma.CommentCreateManyInput>,
	) {
		const data: Prisma.CommentCreateManyInput[] = [];

		for await (let _k of Array.from({ length: count })) {
			data.push({
				body: args?.body || faker.lorem.paragraphs(),
				userId: args?.userId || (await userFactory.create()).id,
				postId: args?.postId || (await postFactory.create()).id,
			});
		}

		return await prisma.comment.createMany({ data });
	}

	public async deleteMany() {
		return await prisma.comment.deleteMany();
	}
}

const commentFactory = new CommentFactory();

export default commentFactory;
