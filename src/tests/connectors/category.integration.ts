// TODO: better paths resolving
import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { createCategoryConnector } from "@database/categoryConnector";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { integrationTestWrapper } from "@src/tests/_utils";
import { faker } from "@faker-js/faker";
import { categoryFactory } from "@src/tests/_factories";

test("Create - Happy", async (t) =>
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

test("Create - Name constraint violation", async (t) =>
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

test("Update - Happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const category = await categoryFactory.create({}, { transient: { trx } });

		t.is(category.updatedAt, null);
		const updatedCategory = await connector.update({ id: category.id, name: "New name" });
		t.truthy(updatedCategory?.updatedAt instanceof Date);
		t.is(updatedCategory?.id, category.id);
		t.is(updatedCategory?.name, "New name");
	}));

test("Update - Obj not found", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		await categoryFactory.create({}, { transient: { trx } });

		const updatedCategory = await connector.update({ id: 1000, name: "New name" });
		t.truthy(updatedCategory === undefined);
	}));

test("Get by name - Happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const category = await categoryFactory.create({ name: "Category Great" }, { transient: { trx } });

		const queriedCategory = await connector.getByName("Category Great");
		t.deepEqual(queriedCategory, category);
	}));

test("Get by name - Obj not found", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		await categoryFactory.create({ name: "Category Great" }, { transient: { trx } });

		const queriedCategory = await connector.getByName("Does not exists");
		t.truthy(queriedCategory === undefined);
	}));

test("Delete - Happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const categories = await Promise.all([1, 2, 3].map((_i) => categoryFactory.create({}, { transient: { trx } })));
		const ids = categories.map((category) => category.id);

		const count = await connector.deleteObjs(ids);
		t.is(count, 3);
	}));

test("Delete - Objs do not exist", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const count = await connector.deleteObjs([1, 2, 3]);
		t.is(count, 0);
	}));
