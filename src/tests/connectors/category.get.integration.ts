import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { createCategoryConnector } from "@database/categoryConnector";
import { categoryFactory } from "@src/tests/_factories";
import { integrationTestWrapper } from "@src/tests/_utils";

test("Happy", async (t) =>
	integrationTestWrapper(async (connection) => {
		const connector = await createCategoryConnector(connection);
		const category = await categoryFactory.create({ name: "First category" }, { transient: { connection } });

		const queriedCategory = await connector.getByName("First category");
		t.deepEqual(queriedCategory, category);
	}));

test("Not found obj", async (t) =>
	integrationTestWrapper(async (connection) => {
		const connector = await createCategoryConnector(connection);
		await categoryFactory.create({ name: "First category" }, { transient: { connection } });

		const queriedCategory = await connector.getByName("Does not exists");
		t.truthy(queriedCategory === undefined);
	}));
