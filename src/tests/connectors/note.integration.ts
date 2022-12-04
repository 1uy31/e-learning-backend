import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { integrationTestWrapper } from "@src/tests/_utils";
import { createNoteConnector } from "@database/noteConnector";
import { diaryFactory } from "@src/tests/_factories";
import * as R from "ramda";
import { faker } from "@faker-js/faker";
import { UniqueIntegrityConstraintViolationError } from "slonik";

test("Create - Happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createNoteConnector(trx);
		const diary = await diaryFactory.create({}, { transient: { trx } });
		const creatingKwargs = {
			notePosition: parseInt(faker.random.numeric(2)),
			content: faker.random.words(),
			sourceUrl: faker.internet.domainName(),
			imageUrl: faker.internet.domainName(),
			diaryId: diary.id,
		};
		const noteA = await connector.create(creatingKwargs);
		Object.entries(creatingKwargs).map(([key, value]) => {
			t.is(R.path([key], noteA), value);
		});
		t.truthy(noteA.createdAt instanceof Date);
		t.is(noteA.updatedAt, null);

		const noteB = await connector.create({
			content: faker.random.words(),
			notePosition: parseInt(faker.random.numeric(2)),
		});
		t.truthy(noteB.id > noteA.id);
		t.truthy(noteB.createdAt.getTime() >= noteA.createdAt.getTime());
	}));

test("Create - Diary ID and note position constraint violation", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createNoteConnector(trx);
		const diary = await diaryFactory.create({}, { transient: { trx } });
		const creatingKwargs = {
			notePosition: parseInt(faker.random.numeric(2)),
			diaryId: diary.id,
		};
		await connector.create(creatingKwargs);
		await t.throwsAsync(() => connector.create(creatingKwargs), {
			instanceOf: UniqueIntegrityConstraintViolationError,
		});
	}));
