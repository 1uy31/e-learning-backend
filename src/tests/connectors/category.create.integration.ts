// TODO: better paths resolving
import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { createCategoryConnector } from "@database/categoryConnector";
import { UniqueIntegrityConstraintViolationError } from "slonik";
import { integrationTestWrapper } from "@src/tests/_utils";

test("Happy", async (t) =>
	integrationTestWrapper(async (connection) => {
		const connector = await createCategoryConnector(connection);
		const firstCategory = await connector.create({ name: "First category" });
		t.is(firstCategory.name, "First category");
		t.truthy(firstCategory.createdAt instanceof Date);
		t.is(firstCategory.updatedAt, null);

		const secondCategory = await connector.create({ name: "Second category" });
		t.is(secondCategory.id, firstCategory.id + 1);
		t.truthy(secondCategory.createdAt.getTime() > firstCategory.createdAt.getTime());
	}));

test("Name constraint violation", async (t) =>
	integrationTestWrapper(async (connection) => {
		const connector = await createCategoryConnector(connection);
		await connector.create({ name: "First category" });
		await t.throwsAsync(() => connector.create({ name: "First category" }), {
			instanceOf: UniqueIntegrityConstraintViolationError,
		});
	}));
