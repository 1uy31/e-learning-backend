import { Factory } from "fishery";
import { Category, createCategoryConnector } from "@database/categoryConnector";
import { faker } from "@faker-js/faker";
import { DatabaseTransactionConnection } from "slonik";
import { createDiaryConnector, Diary } from "@database/diaryConnector";

export const categoryFactory = Factory.define<Category, { trx: DatabaseTransactionConnection }>(
	({ sequence, onCreate, transientParams }) => {
		onCreate(async (category) => {
			const connector = await createCategoryConnector(transientParams.trx);
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

export const diaryFactory = Factory.define<Diary, { trx: DatabaseTransactionConnection; category?: Category }>(
	({ sequence, onCreate, transientParams }) => {
		const sourceUrl = faker.internet.domainName();
		const categoryId = transientParams.category ? transientParams.category.id : null;

		onCreate(async (diary) => {
			const connector = await createDiaryConnector(transientParams.trx);
			return await connector.create({ ...diary, sourceUrl });
		});

		return {
			id: sequence,
			topic: `Topic ${sequence}`,
			rate: sequence,
			reviewCount: sequence,
			sourceUrl: faker.internet.domainName(),
			categoryId: categoryId,
			createdAt: faker.date.soon(),
			updatedAt: null,
		};
	}
);
