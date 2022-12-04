import "module-alias/register.js";
import "ts-node/register";
import anyTest, { TestFn } from "ava";
import { Category, CategoryConnector, createCategoryConnector } from "@database/categoryConnector";
import { CATEGORY_TABLE, getDbPool } from "@src/database";
import { sql } from "slonik";
import { categoryFactory } from "@src/tests/_factories";

const test = anyTest as TestFn<{ connector: CategoryConnector; categories: Array<Category> }>;

test.before(async (t) => {
	t.context = {
		connector: await createCategoryConnector(),
		categories: await Promise.all([1, 2, 3].map((i) => categoryFactory.create({ name: `Category ${i}` }))),
	};
});

test.after.always(async (_t) => {
	const db = await getDbPool();
	await db.query(sql.unsafe`TRUNCATE TABLE ${CATEGORY_TABLE} CASCADE;`);
});

test.serial("Happy", async (t) => {
	const ids = t.context.categories.map((category) => category.id);
	const count = await t.context.connector.deleteObjs(ids);
	t.is(count, 3);
});

test.serial("No obj exists", async (t) => {
	const count = await t.context.connector.deleteObjs([1, 2, 3]);
	t.is(count, 0);
});
