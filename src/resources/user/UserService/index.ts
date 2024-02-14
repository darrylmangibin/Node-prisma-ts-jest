import pagination, { PaginationOptions } from '@lib/pagination';
import { prisma } from '@lib/prisma';
import { Prisma, User } from '@prisma/client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class UserService {
	public async create({
		userData,
		profileData,
	}: {
		userData: Prisma.UserCreateInput;
		profileData: Omit<Prisma.ProfileCreateInput, 'user'>;
	}) {
		try {
			const user = await prisma.$transaction(async ($prisma) => {
				const user = await $prisma.user.create({
					data: userData,
				});

				const profile = await $prisma.profile.create({
					data: { ...profileData, user: { connect: user } },
				});

				return {
					...user,
					profile,
				};
			});

			return user;
		} catch (error) {
			throw error;
		}
	}

	public async findUserById(id: number, args?: Prisma.UserFindFirstArgs) {
		try {
			const user = await prisma.user.findFirstOrThrow<{
				include: Prisma.UserInclude;
			}>({
				...args,
				where: {
					...args?.where,
					id,
				},
			});

			return user;
		} catch (error) {
			throw error;
		}
	}

	public async findUserAndUpdate<T>(
		id: number,
		body: Prisma.UserUpdateInput,
		args?: Omit<Prisma.UserUpdateArgs, 'where' | 'data'>,
	) {
		try {
			const user = await prisma.user.update<{
				include: T extends Prisma.UserInclude ? Prisma.UserInclude : undefined;
				where: Prisma.UserWhereUniqueInput;
				data: Prisma.UserUpdateInput;
			}>({
				where: { id },
				data: body,
				...args,
			});

			return user;
		} catch (error) {
			throw error;
		}
	}

	public async findUserAndDelete(id: number) {
		try {
			const user = await prisma.user.delete({ where: { id } });

			return user;
		} catch (error) {
			throw error;
		}
	}

	public async findManyUsers<T = User>(
		args: PaginationOptions<Prisma.UserFindManyArgs>,
	) {
		try {
			const results = await pagination<
				T extends T ? User & T : User,
				Prisma.UserFindManyArgs
			>('User', args);

			return results;
		} catch (error) {
			throw error;
		}
	}
}
