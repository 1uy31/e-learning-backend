import { Factory } from "fishery";
import { Category, createCategoryConnector } from "@database/categoryConnector";
import { faker } from "@faker-js/faker";

export const categoryFactory = Factory.define<Category>(({ sequence, onCreate }) => {
	onCreate(async (category) => {
		const connector = await createCategoryConnector();
		return await connector.create(category);
	});

	return {
		id: sequence,
		name: `Category ${sequence}`,
		createdAt: faker.date.soon(),
		updatedAt: null,
	};
});
