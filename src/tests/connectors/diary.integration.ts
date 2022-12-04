import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { integrationTestWrapper } from "@src/tests/_utils";
import { createDiaryConnector } from "@database/diaryConnector";
import { categoryFactory, diaryFactory } from "@src/tests/_factories";
import { UniqueIntegrityConstraintViolationError } from "slonik";

test("Create - Happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createDiaryConnector(trx);
		const category = await categoryFactory.create({}, { transient: { trx } });
		const firstDiary = await connector.create({
			topic: "Topic A",
			sourceUrl: "sources.com",
			rate: 5,
			categoryId: category.id,
		});
		t.is(firstDiary.topic, "Topic A");
		t.is(firstDiary.sourceUrl, "sources.com");
		t.is(firstDiary.rate, 5);
		t.is(firstDiary.categoryId, category.id);
		t.truthy(firstDiary.createdAt instanceof Date);
		t.is(firstDiary.updatedAt, null);

		const secondDiary = await connector.create({ topic: "Topic B" });
		t.is(secondDiary.id, firstDiary.id + 1);
		t.truthy(secondDiary.createdAt.getTime() > firstDiary.createdAt.getTime());
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
		const updatedDiary = await connector.update({
			id: diary.id,
			topic: "New topic",
			rate: 5,
			reviewCount: 10,
			sourceUrl: "http://source.com",
			categoryId: undefined,
		});
		t.truthy(updatedDiary?.updatedAt instanceof Date);
		t.is(updatedDiary?.id, diary.id);
		t.is(updatedDiary?.topic, "New topic");
		t.is(updatedDiary?.rate, 5);
		t.is(updatedDiary?.reviewCount, 10);
		t.is(updatedDiary?.categoryId, diary.categoryId);
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
