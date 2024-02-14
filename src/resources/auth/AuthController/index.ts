import { signToken } from '@lib/signToken';
import { UserService } from '@resources/user/UserService';
import { RequestHandler } from 'express';
import { autoInjectable } from 'tsyringe';
import { AuthService } from '../AuthService';
import { Prisma } from '@prisma/client';

@autoInjectable()
export class AuthController {
	private userService: UserService;
	private authService: AuthService;

	constructor(userService?: UserService, authService?: AuthService) {
		this.userService = userService!;
		this.authService = authService!;
	}

	public register: RequestHandler = async (req, res, next) => {
		try {
			const user = await this.userService.create(req.body);

			const token = signToken({ id: user.id });

			return res.status(200).json({ token });
		} catch (error) {
			next(error);
		}
	};

	public login: RequestHandler = async (req, res, next) => {
		try {
			const token = await this.authService.login(req.body);

			return res.status(200).json({ token });
		} catch (error) {
			next(error);
		}
	};

	public getProfile: RequestHandler = async (req, res, next) => {
		try {
			const user = await this.userService.findUserById(req.user.id, {
				include: { profile: true },
			});

			return res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	};

	public updateProfile: RequestHandler = async (req, res, next) => {
		const { name, email, age, address } = req.body;
		try {
			const user = await this.userService.findUserAndUpdate<Prisma.UserInclude>(
				req.user.id,
				{
					email,
					name,
					profile: {
						update: {
							age,
							address,
						},
					},
				},
				{ include: { profile: true } },
			);

			return res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	};

	public deleteProfile: RequestHandler = async (req, res, next) => {
		try {
			const user = await this.userService.findUserAndDelete(req.user.id);

			return res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	};

	public changePassword: RequestHandler = async (req, res, next) => {
		try {
			const user = await this.authService.changePassword(req.user.id, req.body);

			return res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	};
}
