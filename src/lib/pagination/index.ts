import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client';
import { InternalArgs } from '@prisma/client/runtime/library';
import { Request } from 'express';

export interface PaginationOptions<U> {
	pageNumber: number;
	pageSize: number;
	query?: U;
}

async function pagination<T = {}, U = any>(
	model: Prisma.ModelName,
	{ pageNumber, pageSize, query }: PaginationOptions<U>,
) {
	const skip = (pageNumber - 1) * pageSize;
	const take = pageSize;

	// @ts-ignore
	const data: T[] = await prisma[model.toLowerCase()].findMany({
		skip,
		take,
		...query,
	});

	// @ts-ignore
	const totalCount = await prisma[model.toLowerCase()].count({
		// @ts-ignore
		where: query?.where,
	});

	const totalPages = Math.ceil(totalCount / pageSize);
	const hasNextPage = pageNumber < totalPages;
	const hasPreviousPage = pageNumber > 1;

	const prevPage = hasPreviousPage
		? `?pageNumber=${pageNumber - 1}&pageSize=${pageSize}`
		: null;
	const nextPage = hasNextPage
		? `?pageNumber=${pageNumber + 1}&pageSize=${pageSize}`
		: null;

	return {
		data,
		totalCount,
		currentPage: pageNumber,
		totalPages,
		hasNextPage,
		hasPreviousPage,
		prevPage,
		nextPage,
	};
}

export const paginationKeys: (keyof Awaited<ReturnType<typeof pagination>>)[] =
	[
		'currentPage',
		'data',
		'hasNextPage',
		'hasPreviousPage',
		'nextPage',
		'prevPage',
		'totalCount',
		'totalPages',
	];

export const paginationQuery = <T = unknown>(
	query: Request['query'],
): PaginationOptions<T> => {
	return {
		pageNumber: Number(query.pageNumber || 1),
		pageSize: Number(query.pageSize || 10),
		query: query.query as T,
	};
};

export default pagination;
