import { Factory } from "fishery";
import { Category, createCategoryConnector } from "@database/categoryConnector";
import { faker } from "@faker-js/faker";
import { DatabasePoolConnection } from "slonik";

export const categoryFactory = Factory.define<Category, { connection: DatabasePoolConnection }>(
	({ sequence, onCreate, transientParams }) => {
		onCreate(async (category) => {
			const connector = await createCategoryConnector(transientParams.connection);
			return await connector.create(category);
		});

		return {
			id: sequence,
			name: `Category ${sequence}`,
			createdAt: faker.date.soon(),
			updatedAt: null,
		};
	}
);
