// TODO: better paths resolving
import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { createCategoryConnector } from "@database/categoryConnector";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { integrationTestWrapper } from "@src/tests/_utils";
import { categoryFactory } from "@src/tests/_factories";

test("Create - Happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const firstCategory = await connector.create({ name: "Category happy" });
		t.is(firstCategory.name, "Category happy");
		t.truthy(firstCategory.createdAt instanceof Date);
		t.is(firstCategory.updatedAt, null);

		const secondCategory = await connector.create({ name: "Category unhappy" });
		t.is(secondCategory.id, firstCategory.id + 1);
		t.truthy(secondCategory.createdAt.getTime() > firstCategory.createdAt.getTime());
	}));

test("Create - Name constraint violation", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		await connector.create({ name: "Category duplicated" });
		await t.throwsAsync(() => connector.create({ name: "Category duplicated" }), {
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
		const category = await categoryFactory.create({ name: "Category get" }, { transient: { trx } });

		const queriedCategory = await connector.getByName("Category get");
		t.deepEqual(queriedCategory, category);
	}));

test("Get by name - Obj not found", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		await categoryFactory.create({ name: "Category get" }, { transient: { trx } });

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

test("Delete - Obj does not exist", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createCategoryConnector(trx);
		const count = await connector.deleteObjs([1, 2, 3]);
		t.is(count, 0);
	}));
