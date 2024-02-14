import ErrorException from '@lib/ErrorException';
import pagination, { PaginationOptions } from '@lib/pagination';
import { prisma } from '@lib/prisma';
import { Post, Prisma, User } from '@prisma/client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class PostService {
	public async findManyPosts<T>(
		options: PaginationOptions<Prisma.PostFindManyArgs>,
	) {
		try {
			const results = await pagination<
				T extends T ? Post & T : Post,
				Prisma.PostFindManyArgs
			>('Post', options);

			return results;
		} catch (error) {
			throw error;
		}
	}

	public async findPostById(id: number, args?: Prisma.PostFindFirstArgs) {
		try {
			const post = await prisma.post.findFirstOrThrow({
				...args,
				where: {
					id,
					...args?.where,
				},
			});

			return post;
		} catch (error) {
			throw error;
		}
	}

	public async createPost<T extends undefined | Prisma.PostInclude>(
		body: Prisma.PostCreateInput,
		args?: Omit<Prisma.PostCreateArgs, 'data'>,
	) {
		try {
			const post = await prisma.post.create<{
				data: Prisma.PostCreateInput;
				include: T;
			}>({ data: body, ...args });

			return post;
		} catch (error) {
			throw error;
		}
	}

	public async findPostAndUpdate<T extends undefined | Prisma.PostInclude>(
		postId: number,
		body: Prisma.PostUpdateInput,
		args?: Omit<Prisma.PostUpdateArgs, 'where' | 'data'>,
	) {
		try {
			const post = await prisma.$transaction(async ($prisma) => {
				try {
					return await $prisma.post.update<{
						data: Prisma.PostUpdateInput;
						where: Prisma.PostWhereUniqueInput;
						include: T;
					}>({
						where: { id: postId },
						data: body,
						...args,
					});
				} catch (error) {
					throw error;
				}
			});

			return post;
		} catch (error) {
			throw error;
		}
	}

	public async findPostAndDelete(postId: number) {
		try {
			const post = await prisma.post.delete({ where: { id: postId } });

			return post;
		} catch (error) {
			throw error;
		}
	}

	public checkPostUser(userId?: Number, post?: Post) {
		return post?.userId === userId;
	}
}
