import { Prisma, User } from '@prisma/client';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

declare module 'app';

declare global {
	interface AppRoute {
		path: string;
		router: Router;
		registerRoutes: () => void;
	}

	interface AppPayload extends jwt.JwtPayload {
		id: number;
	}

	interface AppSignIn {
		user: User;
		token: string;
	}

	var appSignIn: (args?: Partial<Prisma.UserCreateInput>) => Promise<AppSignIn>;

	namespace Express {
		interface Request {
			user: User;
		}
	}
}
