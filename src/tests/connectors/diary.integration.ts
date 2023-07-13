import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { integrationTestWrapper } from "@src/tests/_utils";
import { createDiaryConnector } from "@database/diaryConnector";
import { categoryFactory, diaryFactory } from "@src/tests/_factories";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import * as R from "ramda";
import { faker } from "@faker-js/faker";

test("create_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const category = await categoryFactory.create({}, { transient: { trx } });
		const creatingKwargs = {
			topic: faker.random.words(10),
			sourceUrl: faker.internet.domainName(),
			rate: Math.floor(Math.random() * 11),
			categoryId: category.id,
		};
		const diaryA = await connector.create(creatingKwargs);
		Object.entries(creatingKwargs).map(([key, value]) => {
			t.is(R.path([key], diaryA), value, `Failed on asserting ${key}`);
		});
		t.truthy(diaryA.createdAt instanceof Date);
		t.is(diaryA.updatedAt, null);

		const diaryB = await connector.create({ topic: faker.random.words(10) });
		t.truthy(diaryB.id >= diaryA.id);
		t.truthy(diaryB.createdAt.getTime() >= diaryA.createdAt.getTime());
	}));

test("create_categorizedTopicConstraintViolation", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const category = await categoryFactory.create({}, { transient: { trx } });
		await connector.create({
			topic: "Topic Great",
			categoryId: category.id,
		});
		await t.throwsAsync(
			() =>
				connector.create({
					topic: "Topic Great",
					categoryId: category.id,
				}),
			{
				instanceOf: UniqueIntegrityConstraintViolationError,
			}
		);
	}));

test("update_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const category = await categoryFactory.create({}, { transient: { trx } });
		const diary = await diaryFactory.create({}, { transient: { trx, category } });
		t.is(diary.updatedAt, null);

		const updatingKwargs = {
			id: diary.id,
			topic: faker.random.words(10),
			rate: 5,
			reviewCount: 10,
			sourceUrl: faker.internet.domainName(),
			categoryId: undefined,
		};
		const updatedDiary = await connector.update(updatingKwargs);

		Object.entries(updatingKwargs).map(([key, value]) => {
			const newValue = value !== undefined ? value : R.path([key], diary);
			t.is(R.path([key], updatedDiary), newValue, `Failed on asserting ${key}`);
		});
		t.truthy(updatedDiary?.updatedAt instanceof Date);
	}));

test("update_objNotFound", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		await diaryFactory.create({}, { transient: { trx } });

		const updatedDiary = await connector.update({ id: 1000, topic: "New topic" });
		t.truthy(updatedDiary === undefined);
	}));

test("getByCategorizedTopic_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const category = await categoryFactory.create({}, { transient: { trx } });
		const diaryA = await diaryFactory.create({}, { transient: { trx, category } });
		const diaryB = await diaryFactory.create({}, { transient: { trx } });
		const diaryHasParentDiary = await diaryFactory.create({}, { transient: { trx, parentDiary: diaryB } });

		for (const testCase of [
			{
				topic: diaryA.topic,
				categoryId: undefined,
				categoryName: category.name,
				diaryParentId: undefined,
				diaries: [diaryA],
				expectedCount: 1,
			},
			{
				topic: diaryA.topic,
				categoryId: category.id,
				categoryName: undefined,
				diaryParentId: undefined,
				diaries: [diaryA],
				expectedCount: 1,
			},
			{
				topic: diaryB.topic,
				categoryId: undefined,
				categoryName: undefined,
				diaryParentId: undefined,
				diaries: [diaryB],
				expectedCount: 1,
			},
			{
				topic: undefined,
				categoryId: undefined,
				categoryName: undefined,
				diaryParentId: undefined,
				diaries: [diaryA, diaryB],
				expectedCount: 2,
			},
			{
				topic: undefined,
				categoryId: undefined,
				categoryName: undefined,
				diaryParentId: diaryB.id,
				diaries: [diaryHasParentDiary],
				expectedCount: 1,
			},
		]) {
			const targetDiaryAQuery = await connector.getByCategorizedTopic(
				testCase.topic,
				testCase.categoryId,
				testCase.categoryName,
				testCase.diaryParentId
			);
			t.is(targetDiaryAQuery?.length, testCase.expectedCount);
			t.deepEqual(targetDiaryAQuery, testCase.diaries);
		}
	}));

test("delete_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const diaries = await Promise.all([1, 2, 3].map((_i) => diaryFactory.create({}, { transient: { trx } })));
		const ids = diaries.map((diary) => diary.id);

		const count = await connector.deleteObjs(ids);
		t.is(count, 3);
	}));

test("delete_objsDoNotExist", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const count = await connector.deleteObjs([1, 2, 3]);
		t.is(count, 0);
	}));
