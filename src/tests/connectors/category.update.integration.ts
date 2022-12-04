import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { createCategoryConnector } from "@database/categoryConnector";
import { integrationTestWrapper } from "@src/tests/_utils";
import { categoryFactory } from "@src/tests/_factories";

test("Happy", async (t) =>
	integrationTestWrapper(async (connection) => {
		const connector = await createCategoryConnector(connection);
		const category = await categoryFactory.create({}, { transient: { connection } });

		t.is(category.updatedAt, null);
		const updatedCategory = await connector.update({ id: category.id, name: "New name" });
		t.truthy(updatedCategory?.updatedAt instanceof Date);
		t.is(updatedCategory?.id, category.id);
		t.is(updatedCategory?.name, "New name");
	}));

test("Not found obj", async (t) =>
	integrationTestWrapper(async (connection) => {
		const connector = await createCategoryConnector(connection);
		await categoryFactory.create({}, { transient: { connection } });

		const updatedCategory = await connector.update({ id: 1000, name: "New name" });
		t.truthy(updatedCategory === undefined);
	}));
