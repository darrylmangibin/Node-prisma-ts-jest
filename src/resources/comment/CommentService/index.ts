import pagination, { PaginationOptions } from '@lib/pagination';
import { prisma } from '@lib/prisma';
import { Comment, Prisma } from '@prisma/client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class CommentService {
	public async findManyComments<T>(
		options: PaginationOptions<Prisma.CommentFindManyArgs>,
	) {
		try {
			const results = await pagination<
				T extends T ? Comment & T : Comment,
				Prisma.CommentFindManyArgs
			>('Comment', options);

			return results;
		} catch (error) {
			throw error;
		}
	}

	public async createComment<T extends Prisma.CommentInclude | undefined>(
		data: Prisma.CommentCreateInput,
		args?: Omit<Prisma.CommentCreateArgs, 'data'>,
	) {
		try {
			const comment = await prisma.comment.create<{
				data: Prisma.CommentCreateInput;
				include: T;
			}>({ data, ...args });

			return comment;
		} catch (error) {
			throw error;
		}
	}

	public async findCommentById<T extends Prisma.CommentInclude | undefined>(
		commentId: number,
		args?: Prisma.CommentFindFirstArgs,
	) {
		try {
			const comment = await prisma.comment.findFirstOrThrow<{ include: T }>({
				where: { id: commentId },
				...args,
			});

			return comment;
		} catch (error) {
			throw error;
		}
	}

	public async findCommentAndUpdate<
		T extends Prisma.CommentInclude | undefined,
	>(
		commentId: number,
		data: Prisma.CommentUpdateInput,
		args?: Omit<Prisma.CommentUpdateArgs, 'data' | 'where'>,
	) {
		try {
			const comment = await prisma.comment.update<{
				where: Prisma.CommentWhereUniqueInput;
				data: Prisma.CommentUpdateInput;
				include: T;
			}>({ where: { id: commentId }, data, ...args });

			return comment;
		} catch (error) {
			throw error;
		}
	}

	public async findCommentAndDelete(commentId: number) {
		try {
			const comment = await prisma.comment.delete({ where: { id: commentId } });

			return comment;
		} catch (error) {
			throw error;
		}
	}

	public checkCommentOwner(userId: number, comment: Comment) {
		return comment.userId === userId;
	}
}
