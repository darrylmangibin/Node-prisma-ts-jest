import { hashPassword } from '@lib/hashPassword';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient().$extends({
	query: {
		user: {
			async create({ query, args }) {
				if (args.data.password) {
					args.data.password = await hashPassword(args.data.password);
				}

				return query(args);
			},
			async update({ query, args }) {
				if (args.data.password && typeof args.data.password === 'string') {
					args.data.password = await hashPassword(args.data.password);
				}

				return query(args);
			},
		},
	},
});
