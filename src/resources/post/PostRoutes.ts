import { Router } from 'express';
import { autoInjectable } from 'tsyringe';
import { PostController } from './PostController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import { postCreateOrUpdateValidation } from './postValidation';
import { CommentRoutes } from '@resources/comment/CommentRoutes';

@autoInjectable()
export class PostRoutes implements AppRoute {
	public path = 'posts';
	public router = Router();

	private postController: PostController;

	constructor(postController?: PostController) {
		this.postController = postController!;

		this.registerRoutes();
	}

	public registerRoutes() {
		this.router.use('/:postId/comments', new CommentRoutes().router);
		this.router.use(authMiddleware);

		this.router
			.route('/')
			.get(this.postController.findManyPosts)
			.post(
				validationMiddleware(postCreateOrUpdateValidation),
				this.postController.createPost,
			);

		this.router
			.route('/:postId')
			.get(this.postController.findPostById)
			.put(
				validationMiddleware(postCreateOrUpdateValidation),
				this.postController.findPostAndUpdate,
			)
			.delete(this.postController.findPostAndDelete);
	}
}
