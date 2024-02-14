import { autoInjectable } from 'tsyringe';
import { UserService } from '../UserService';
import { RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { paginationQuery } from '@lib/pagination';

@autoInjectable()
export class UserController {
	private userService: UserService;

	constructor(userService?: UserService) {
		this.userService = userService!;
	}

	public findManyUsers: RequestHandler = async (req, res, next) => {
		try {
			const options = paginationQuery<Prisma.UserFindManyArgs>(req.query);

			const results = await this.userService.findManyUsers({
				...options,
				query: {
					...options.query,
					where: {
						NOT: {
							id: req.user.id,
						},
					},
				},
			});

			return res.status(200).json(results);
		} catch (error) {
			next(error);
		}
	};

	public findUserById: RequestHandler = async (req, res, next) => {
		try {
			const { query } = req.query as unknown as {
				query: Prisma.UserFindFirstArgs;
			};

			const user = await this.userService.findUserById(
				Number(req.params.userId),
				query,
			);

			return res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	};

	public findUserAndUpdate: RequestHandler = async (req, res, next) => {
		try {
			const { email, name, role, age, address } = req.body;

			const user = await this.userService.findUserAndUpdate(
				Number(req.params.userId),
				{
					email,
					name,
					role,
					profile: {
						update: {
							age,
							address,
						},
					},
				},
				{
					include: {
						profile: true,
					},
				},
			);

			return res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	};

	public findUserAndDelete: RequestHandler = async (req, res, next) => {
		try {
			const user = await this.userService.findUserAndDelete(
				Number(req.params.userId),
			);

			return res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	};
}
