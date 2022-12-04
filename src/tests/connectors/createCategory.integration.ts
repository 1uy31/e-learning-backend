import "module-alias/register.js";
import "ts-node/register";
import anyTest, { TestFn } from "ava";
import { CategoryConnector, createCategoryConnector } from "@database/categoryConnector";
import { CATEGORY_TABLE, getDbPool } from "@src/database";
import { sql, UniqueIntegrityConstraintViolationError } from "slonik";

const test = anyTest as TestFn<{ connector: CategoryConnector }>;

test.before(async (t) => {
	t.context = { connector: await createCategoryConnector() };
});

test.afterEach.always(async (_t) => {
	const db = await getDbPool();
	await db.query(sql.unsafe`TRUNCATE TABLE ${CATEGORY_TABLE} CASCADE;`);
});

test.serial("Create - happy", async (t) => {
	const firstCategory = await t.context.connector.create({ name: "First category" });
	t.is(firstCategory.name, "First category");
	t.truthy(firstCategory.createdAt instanceof Date);
	t.is(firstCategory.updatedAt, null);

	const secondCategory = await t.context.connector.create({ name: "Second category" });
	t.is(secondCategory.id, firstCategory.id + 1);
	t.truthy(secondCategory.createdAt.getTime() > firstCategory.createdAt.getTime());
});

test.serial("Create - name constraint violation", async (t) => {
	await t.context.connector.create({ name: "First category" });
	await t.throwsAsync(() => t.context.connector.create({ name: "First category" }), {
		instanceOf: UniqueIntegrityConstraintViolationError,
	});
});
