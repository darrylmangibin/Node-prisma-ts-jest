import { faker } from '@faker-js/faker';
import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client';

export class CategoryFactory {
	public async create(data?: Partial<Prisma.CategoryCreateInput>) {
		return await prisma.category.create({
			data: {
				name: data?.name || faker.commerce.productName(),
			},
		});
	}

	public async createMany(
		count: number = 1,
		args?: Partial<Prisma.CategoryCreateManyInput>,
	) {
		const data: Prisma.CategoryCreateManyInput[] = [];

		for await (let _k of Array.from({ length: count })) {
			data.push({
				name: args?.name || faker.commerce.productName(),
			});
		}

		return await prisma.category.createMany({ data });
	}

	public async deleteMany() {
		return await prisma.category.deleteMany();
	}
}

const categoryFactory = new CategoryFactory();

export default categoryFactory;
