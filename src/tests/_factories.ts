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
			name: faker.random.words(10),
			createdAt: faker.date.soon(),
			updatedAt: null,
		};
	}
);

export const diaryFactory = Factory.define<Diary, { trx: DatabaseTransactionConnection; category?: Category }>(
	({ sequence, onCreate, transientParams }) => {
		// TODO remove sourceUrl?
		const sourceUrl = faker.internet.domainName();
		const categoryId = transientParams.category ? transientParams.category.id : null;

		onCreate(async (diary) => {
			const connector = await createDiaryConnector(transientParams.trx);
			const hey = await connector.create({ ...diary, sourceUrl, categoryId });
			console.log("hey", hey);
			return hey;
		});

		return {
			id: sequence,
			topic: faker.random.words(10),
			rate: Math.floor(Math.random() * 11),
			reviewCount: sequence,
			sourceUrl: faker.internet.domainName(),
			categoryId: categoryId,
			createdAt: faker.date.soon(),
			updatedAt: null,
		};
	}
);
