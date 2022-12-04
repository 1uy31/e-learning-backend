import "module-alias/register.js";
import "ts-node/register";
import anyTest, { TestFn } from "ava";
import { Category, CategoryConnector, createCategoryConnector } from "@database/categoryConnector";
import { CATEGORY_TABLE, getDbPool } from "@src/database";
import { sql } from "slonik";
import { categoryFactory } from "@src/tests/_factories";

const test = anyTest as TestFn<{ connector: CategoryConnector; category: Category }>;

test.before(async (t) => {
	t.context = {
		connector: await createCategoryConnector(),
		category: await categoryFactory.create({ name: "Category A" }),
	};
});

test.after.always(async (_t) => {
	const db = await getDbPool();
	await db.query(sql.unsafe`DELETE FROM ${CATEGORY_TABLE} WHERE name = 'Category A';`);
});

test.serial("Happy", async (t) => {
	const category = await t.context.connector.getByName("Category A");
	t.deepEqual(category, t.context.category);
});

test.serial("Not found obj", async (t) => {
	const category = await t.context.connector.getByName("Does not exists");
	t.truthy(category === undefined);
});
