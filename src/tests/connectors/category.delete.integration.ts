import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { createCategoryConnector } from "@database/categoryConnector";
import { categoryFactory } from "@src/tests/_factories";
import { integrationTestWrapper } from "@src/tests/_utils";

test("Happy", async (t) =>
	integrationTestWrapper(async (connection) => {
		const connector = await createCategoryConnector(connection);
		const categories = await Promise.all(
			[1, 2, 3].map((_i) => categoryFactory.create({}, { transient: { connection } }))
		);
		const ids = categories.map((category) => category.id);

		const count = await connector.deleteObjs(ids);
		t.is(count, 3);
	}));

test("No obj exists", async (t) =>
	integrationTestWrapper(async (connection) => {
		const connector = await createCategoryConnector(connection);
		const count = await connector.deleteObjs([1, 2, 3]);
		t.is(count, 0);
	}));
