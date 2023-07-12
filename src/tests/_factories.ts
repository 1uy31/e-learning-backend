import { Factory } from "fishery";
import { Category, createCategoryConnector } from "@database/categoryConnector";
import { faker } from "@faker-js/faker";
import { DatabaseTransactionConnection } from "slonik";
import { createDiaryConnector, Diary } from "@database/diaryConnector";
import { createNoteConnector, Note } from "@database/noteConnector";

export const categoryFactory = Factory.define<Category, { trx: DatabaseTransactionConnection; name?: string }>(
	({ sequence, onCreate, transientParams }) => {
		onCreate(async (category) => {
			const connector = await createCategoryConnector(transientParams.trx);
			return await connector.create(category);
		});

		return {
			id: sequence,
			name: transientParams.name || faker.random.words(10),
			createdAt: faker.date.soon(),
			updatedAt: null,
		};
	}
);

export const diaryFactory = Factory.define<
	Diary,
	{ trx: DatabaseTransactionConnection; category?: Category; parentDiary?: Diary }
>(({ sequence, onCreate, transientParams }) => {
	const categoryId = transientParams.category?.id || null;
	const parentDiaryId = transientParams.parentDiary?.id || null;

	onCreate(async (diary: Diary) => {
		const connector = await createDiaryConnector(transientParams.trx);
		return await connector.create({ ...diary, categoryId, parentDiaryId });
	});

	return {
		id: sequence,
		topic: faker.random.words(10),
		rate: Math.floor(Math.random() * 11),
		reviewCount: sequence,
		sourceUrl: faker.internet.domainName(),
		categoryId: categoryId,
		parentDiaryId: parentDiaryId,
		createdAt: faker.date.soon(),
		updatedAt: null,
	};
});

export const noteFactory = Factory.define<Note, { trx: DatabaseTransactionConnection; diary?: Diary }>(
	({ sequence, onCreate, transientParams }) => {
		const diaryId = transientParams.diary?.id || null;

		onCreate(async (note: Note) => {
			const connector = await createNoteConnector(transientParams.trx);
			return await connector.create({ ...note, diaryId });
		});

		return {
			id: sequence,
			content: faker.random.words(20),
			notePosition: sequence,
			imageUrl: faker.internet.domainName(),
			sourceUrl: faker.internet.domainName(),
			diaryId,
			createdAt: faker.date.soon(),
			updatedAt: null,
		};
	}
);
