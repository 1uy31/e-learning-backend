// TODO: better paths resolving
import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { createCategoryConnector } from "@database/categoryConnector";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { integrationTestWrapper } from "@src/tests/_utils";
import { faker } from "@faker-js/faker";
import { categoryFactory, diaryFactory } from "@src/tests/_factories";

test("create_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const categoryName = faker.random.words(10);
		const categoryA = await connector.create({ name: categoryName });
		t.is(categoryA.name, categoryName);
		t.truthy(categoryA.createdAt instanceof Date);
		t.is(categoryA.updatedAt, null);

		const categoryB = await connector.create({ name: faker.random.words(10) });
		t.truthy(categoryB.id >= categoryA.id);
		t.truthy(categoryB.createdAt.getTime() >= categoryA.createdAt.getTime());
	}));

test("create_nameConstraintViolation", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const creatingKwargs = {
			name: faker.random.words(10),
		};
		await connector.create(creatingKwargs);
		await t.throwsAsync(() => connector.create(creatingKwargs), {
			instanceOf: UniqueIntegrityConstraintViolationError,
		});
	}));

test("update_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const category = await categoryFactory.create({}, { transient: { trx } });

		t.is(category.updatedAt, null);
		const updatedCategory = await connector.update({ id: category.id, name: "New name" });
		t.truthy(updatedCategory?.updatedAt instanceof Date);
		t.is(updatedCategory?.id, category.id);
		t.is(updatedCategory?.name, "New name");
	}));

test("update_objNotFound", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		await categoryFactory.create({}, { transient: { trx } });

		const updatedCategory = await connector.update({ id: 1000, name: "New name" });
		t.truthy(updatedCategory === undefined);
	}));

test("getAll_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const categories = await Promise.all(
			Array.from({ length: 10 }, () => categoryFactory.create({}, { transient: { trx } }))
		);

		const queriedCategories = await connector.getAll("", 2, 1);
		t.deepEqual(queriedCategories.categories[0], { ...categories[1], diaryCount: 0 });
		t.deepEqual(queriedCategories.categories[1], { ...categories[2], diaryCount: 0 });
		t.is(queriedCategories.total, 10);
	}));

test("getAll_filterByName", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		await Promise.all(Array.from({ length: 10 }, () => categoryFactory.create({}, { transient: { trx } })));
		const testCategory = await categoryFactory.create({ name: "testCategory" }, { transient: { trx } });
		await diaryFactory.create({}, { transient: { trx, category: testCategory } });

		const queriedCategories = await connector.getAll("testCategory", 2, 0);
		t.deepEqual(queriedCategories.categories[0], { ...testCategory, diaryCount: 1 });
		t.is(queriedCategories.total, 1);
	}));

test("getAll_empty", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);

		const queriedCategories = await connector.getAll("", 2, 1);
		t.is(queriedCategories.total, 0);
	}));

test("delete_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const categories = await Promise.all([1, 2, 3].map((_i) => categoryFactory.create({}, { transient: { trx } })));
		const ids = categories.map((category) => category.id);

		const count = await connector.deleteObjs(ids);
		t.is(count, 3);
	}));

test("delete_objsDoNotExist", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const count = await connector.deleteObjs([1, 2, 3]);
		t.is(count, 0);
	}));
