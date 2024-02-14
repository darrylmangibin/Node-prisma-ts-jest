import { Router } from 'express';
import { autoInjectable } from 'tsyringe';
import { CommentController } from './CommentController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import { commentCreateOrUpdateValidation } from './commentValidation';

@autoInjectable()
export class CommentRoutes implements AppRoute {
	public path = 'comments';
	public router = Router({ mergeParams: true });

	private commentController: CommentController;

	constructor(commentController?: CommentController) {
		this.commentController = commentController!;

		this.registerRoutes();
	}

	public registerRoutes() {
		this.router.use(authMiddleware);

		this.router
			.route('/')
			.get(this.commentController.findManyComments)
			.post(
				validationMiddleware(commentCreateOrUpdateValidation),
				this.commentController.createComment,
			);

		this.router
			.route('/:commentId')
			.get(this.commentController.findCommentById)
			.put(
				validationMiddleware(commentCreateOrUpdateValidation),
				this.commentController.findCommentAndUpdate,
			)
			.delete(this.commentController.findCommentAndDelete);
	}
}
