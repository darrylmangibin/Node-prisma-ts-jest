import { autoInjectable } from 'tsyringe';
import { CommentService } from '../CommentService';
import { RequestHandler } from 'express';
import { PaginationOptions, paginationQuery } from '@lib/pagination';
import { Prisma, User } from '@prisma/client';
import ErrorException from '@lib/ErrorException';

@autoInjectable()
export class CommentController {
	private commentService: CommentService;

	constructor(commentService?: CommentService) {
		this.commentService = commentService!;
	}

	public findManyComments: RequestHandler = async (req, res, next) => {
		try {
			let options = paginationQuery<Prisma.CommentFindManyArgs>(req.query);

			if (req.params.postId) {
				options = {
					...options,
					query: {
						...options.query,
						where: {
							postId: Number(req.params.postId),
						},
					},
				};
			}

			const results = await this.commentService.findManyComments<{
				user?: User;
			}>(options);

			return res.status(200).json(results);
		} catch (error) {
			next(error);
		}
	};

	public createComment: RequestHandler = async (req, res, next) => {
		try {
			const comment = await this.commentService.createComment(
				{
					...req.body,
					post: { connect: { id: Number(req.params.postId) } },
					user: { connect: { id: req.user.id } },
				},
				{
					include: {
						user: {
							include: {
								profile: true,
							},
						},
					},
				},
			);

			return res.status(201).json(comment);
		} catch (error) {
			next(error);
		}
	};

	public findCommentById: RequestHandler = async (req, res, next) => {
		try {
			const query = req.query as unknown as Prisma.CommentFindFirstArgs;

			const comment = await this.commentService.findCommentById(
				Number(req.params.commentId),
				query,
			);

			return res.status(200).json(comment);
		} catch (error) {
			next(error);
		}
	};

	public findCommentAndUpdate: RequestHandler = async (req, res, next) => {
		try {
			const commentId = Number(req.params.commentId);

			const comment = await this.commentService.findCommentById(commentId);

			if (!this.commentService.checkCommentOwner(req.user.id, comment)) {
				throw new ErrorException(403);
			}

			const query = req.query as unknown as Prisma.CommentUpdateArgs;

			const updatedComment =
				await this.commentService.findCommentAndUpdate<Prisma.CommentInclude>(
					commentId,
					req.body,
					query,
				);

			return res.status(200).json(updatedComment);
		} catch (error) {
			next(error);
		}
	};

	public findCommentAndDelete: RequestHandler = async (req, res, next) => {
		try {
			const commentId = Number(req.params.commentId);

			const comment = await this.commentService.findCommentById(commentId);

			if (!this.commentService.checkCommentOwner(req.user.id, comment)) {
				throw new ErrorException(403);
			}

			const deletedComment = await this.commentService.findCommentAndDelete(
				commentId,
			);

			return res.status(200).json(deletedComment);
		} catch (error) {
			next(error);
		}
	};
}
