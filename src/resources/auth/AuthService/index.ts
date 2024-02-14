import ErrorException from '@lib/ErrorException';
import { comparePassword } from '@lib/comparePassword';
import { prisma } from '@lib/prisma';
import { signToken } from '@lib/signToken';
import { Prisma } from '@prisma/client';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class AuthService {
	public async login(body: Pick<Prisma.UserCreateInput, 'email' | 'password'>) {
		try {
			const user = await prisma.user.findFirst({
				where: { email: body.email },
			});

			const isPasswordMatch = await comparePassword(
				body.password,
				user?.password,
			);

			if (!user || !isPasswordMatch) {
				throw new ErrorException(401, { message: 'Invalid credentials' });
			}

			const token = signToken({ id: user.id });

			return token;
		} catch (error) {
			throw error;
		}
	}

	public async changePassword(
		id: number,
		{
			newPassword,
			currentPassword,
		}: { newPassword: string; currentPassword: string },
	) {
		try {
			const user = await prisma.user.findFirst({ where: { id } });

			const isPasswordMatch = await comparePassword(
				currentPassword,
				user?.password,
			);

			if (!user || !isPasswordMatch) {
				throw new ErrorException(401, { message: 'Password incorrect' });
			}

			const updatedUser = await prisma.user.update({
				where: { id },
				data: {
					password: newPassword,
				},
			});

			return updatedUser;
		} catch (error) {
			throw error;
		}
	}
}
