import "module-alias/register.js";
import "ts-node/register";
import anyTest, { TestFn } from "ava";
import { Category, CategoryConnector, createCategoryConnector } from "@database/categoryConnector";
import { CATEGORY_TABLE, getDbPool } from "@src/database";
import { sql } from "slonik";
import { categoryFactory } from "@src/tests/_factories";

const test = anyTest as TestFn<{ connector: CategoryConnector; category: Category }>;

test.before(async (t) => {
	t.context = { connector: await createCategoryConnector(), category: await categoryFactory.create() };
});

test.after.always(async (_t) => {
	const db = await getDbPool();
	await db.query(sql.unsafe`DELETE FROM ${CATEGORY_TABLE} WHERE name = 'New name';`);
});

test.serial("Happy", async (t) => {
	t.is(t.context.category.updatedAt, null);
	const updatedCategory = await t.context.connector.update({ id: t.context.category.id, name: "New name" });
	t.truthy(updatedCategory?.updatedAt instanceof Date);
	t.is(updatedCategory?.id, t.context.category.id);
	t.is(updatedCategory?.name, "New name");
});

test.serial("Not found obj", async (t) => {
	const updatedCategory = await t.context.connector.update({ id: 1000, name: "New name" });
	t.truthy(updatedCategory === undefined);
});
