import { Category, ExtendedCategory, createCategoryConnector } from "@database/categoryConnector";

export type CategoryService = {
	getAll: (
		_obj: never,
		kwargs: { name?: string; limit?: number; offset?: number }
	) => Promise<{ total: number; categories: Readonly<Array<ExtendedCategory>> }>;
	create: (_obj: never, kwargs: { name: string }) => Promise<Category>;
};

export const createCategoryService = (): CategoryService => {
	const getAll = async (_obj: undefined, kwargs: { name?: string; limit?: number; offset?: number }) => {
		const categoryConnector = await createCategoryConnector();
		const { total, categories } = await categoryConnector.getAll(kwargs.name, kwargs.limit, kwargs.offset);
		return {
			total,
			categories,
		};
	};

	const create = async (_obj: undefined, kwargs: { name: string }) => {
		const categoryConnector = await createCategoryConnector();
		const category = await categoryConnector.create({ name: kwargs.name });
		return category;
	};

	return {
		getAll,
		create,
	};
};
