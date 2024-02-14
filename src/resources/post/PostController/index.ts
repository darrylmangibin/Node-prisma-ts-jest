import { autoInjectable } from 'tsyringe';
import { PostService } from '../PostService';
import { RequestHandler } from 'express';
import { paginationQuery } from '@lib/pagination';
import { Prisma } from '@prisma/client';
import ErrorException from '@lib/ErrorException';

@autoInjectable()
export class PostController {
	private postService: PostService;

	constructor(postService?: PostService) {
		this.postService = postService!;
	}

	public findManyPosts: RequestHandler = async (req, res, next) => {
		try {
			const options = paginationQuery<Prisma.PostFindManyArgs>(req.query);

			const results = await this.postService.findManyPosts(options);

			return res.status(200).json(results);
		} catch (error) {
			next(error);
		}
	};

	public findPostById: RequestHandler = async (req, res, next) => {
		try {
			const postId = Number(req.params.postId);

			const query = req.query as unknown as Prisma.PostFindFirstArgs;

			const post = await this.postService.findPostById(postId, query);

			return res.status(200).json(post);
		} catch (error) {
			next(error);
		}
	};

	public createPost: RequestHandler = async (req, res, next) => {
		try {
			const post = await this.postService.createPost<Prisma.PostInclude>(
				{
					...req.body,
					user: { connect: { id: req.user.id } },
				},
				{ include: { user: true } },
			);

			return res.status(201).json(post);
		} catch (error) {
			next(error);
		}
	};

	public findPostAndUpdate: RequestHandler = async (req, res, next) => {
		try {
			const postId = Number(req.params.postId);

			const query = req.query as unknown as Prisma.PostUpdateArgs;

			let post = await this.postService.findPostById(postId);

			if (!this.postService.checkPostUser(req.user.id, post)) {
				throw new ErrorException(403);
			}

			post = await this.postService.findPostAndUpdate(postId, req.body, query);

			return res.status(200).json(post);
		} catch (error) {
			next(error);
		}
	};

	public findPostAndDelete: RequestHandler = async (req, res, next) => {
		try {
			const postId = Number(req.params.postId);

			let post = await this.postService.findPostById(postId);

			if (!this.postService.checkPostUser(req.user.id, post)) {
				throw new ErrorException(403);
			}

			post = await this.postService.findPostAndDelete(postId);

			return res.status(200).json(post);
		} catch (error) {
			next(error);
		}
	};
}
