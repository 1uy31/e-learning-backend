import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { integrationTestWrapper } from "@src/tests/_utils";
import { createDiaryConnector } from "@database/diaryConnector";
import { categoryFactory, diaryFactory } from "@src/tests/_factories";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import * as R from "ramda";

test("Create - Happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const category = await categoryFactory.create({}, { transient: { trx } });
		const creatingKwargs = {
			topic: "Topic A",
			sourceUrl: "sources.com",
			rate: 5,
			categoryId: category.id,
		};
		const diaryA = await connector.create(creatingKwargs);
		Object.entries(creatingKwargs).map(([key, value]) => {
			t.is(R.path([key], diaryA), value);
		});
		t.truthy(diaryA.createdAt instanceof Date);
		t.is(diaryA.updatedAt, null);

		const diaryB = await connector.create({ topic: "Topic B" });
		t.is(diaryB.id, diaryA.id + 1);
		t.truthy(diaryB.createdAt.getTime() > diaryA.createdAt.getTime());
	}));

test("Create - Categorized topic constraint violation", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const category = await categoryFactory.create({}, { transient: { trx } });
		await connector.create({
			topic: "Topic C",
			categoryId: category.id,
		});
		await t.throwsAsync(
			() =>
				connector.create({
					topic: "Topic C",
					categoryId: category.id,
				}),
			{
				instanceOf: UniqueIntegrityConstraintViolationError,
			}
		);
	}));

test("Update - Happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const category = await categoryFactory.create({}, { transient: { trx } });
		const diary = await diaryFactory.create({}, { transient: { trx, category } });
		t.is(diary.updatedAt, null);
		const updatingKwargs = {
			id: diary.id,
			topic: "New topic",
			rate: 5,
			reviewCount: 10,
			sourceUrl: "sources.com",
			categoryId: undefined,
		};
		const updatedDiary = await connector.update(updatingKwargs);

		Object.entries(updatingKwargs).map(([key, value]) => {
			const newValue = value !== undefined ? value : R.path([key], diary);
			t.is(R.path([key], updatedDiary), newValue);
		});
		t.truthy(updatedDiary?.updatedAt instanceof Date);
	}));

test("Update - Obj not found", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		await diaryFactory.create({}, { transient: { trx } });

		const updatedDiary = await connector.update({ id: 1000, topic: "New topic" });
		t.truthy(updatedDiary === undefined);
	}));

test("Get by categorized topic - Happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const category = await categoryFactory.create({ name: "Category" }, { transient: { trx } });
		const diaryD = await diaryFactory.create({ topic: "Topic D", categoryId: category.id }, { transient: { trx } });
		const diaryE = await diaryFactory.create({ topic: "Topic E" }, { transient: { trx } });

		const queriedDiary = await connector.getByCategorizedTopic(category.name, diaryD.topic);
		t.deepEqual(queriedDiary, diaryD);
		t.truthy((await connector.getByCategorizedTopic(category.name, diaryE.topic)) === undefined);
	}));

test("Get by categorized topic - Obj not found", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		await categoryFactory.create({ name: "Category F" }, { transient: { trx } });

		const queriedCategory = await connector.getByCategorizedTopic("Does not exists", "Category F");
		t.truthy(queriedCategory === undefined);
	}));

test("Delete - Happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const diaries = await Promise.all([1, 2, 3].map((_i) => diaryFactory.create({}, { transient: { trx } })));
		const ids = diaries.map((diary) => diary.id);

		const count = await connector.deleteObjs(ids);
		t.is(count, 3);
	}));

test("Delete - Objs do not exist", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const count = await connector.deleteObjs([1, 2, 3]);
		t.is(count, 0);
	}));
