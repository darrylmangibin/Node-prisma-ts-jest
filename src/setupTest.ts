import 'reflect-metadata';
import 'dotenv/config';
import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client';
import userFactory from '@resources/user/UserFactory';
import { signToken } from '@lib/signToken';

global.appSignIn = async (args?: Partial<Prisma.UserCreateInput>) => {
	const user = await userFactory.create(args);

	const token = signToken({ id: user.id });

	return { user, token };
};

afterEach(async () => {
	const deleteUsers = prisma.user.deleteMany();
	const deletePosts = prisma.post.deleteMany();
	const deleteComments = prisma.comment.deleteMany();
	const deleteCategories = prisma.category.deleteMany();

	await prisma.$transaction([
		deleteUsers,
		deletePosts,
		deleteComments,
		deleteCategories,
	]);
});

afterAll(async () => {
	await prisma.$disconnect();
});
