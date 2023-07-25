import "module-alias/register.js";
import "ts-node/register";
import test from "ava";
import { integrationTestWrapper } from "@src/tests/_utils";
import { createNoteConnector } from "@database/noteConnector";
import { diaryFactory, noteFactory } from "@src/tests/_factories";
import * as R from "ramda";
import { faker } from "@faker-js/faker";
import { UniqueIntegrityConstraintViolationError } from "slonik";

const FAKED_CONTENT = { a: "b", 123: "c", d: true };

test("create_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createNoteConnector(trx);
		const diary = await diaryFactory.create({}, { transient: { trx } });
		const creatingKwargs = {
			notePosition: parseInt(faker.random.numeric(2)),
			content: FAKED_CONTENT,
			sourceUrl: faker.internet.domainName(),
			filePath: faker.internet.domainName(),
			diaryId: diary.id,
		};
		const noteA = await connector.create(creatingKwargs);
		Object.entries(creatingKwargs).map(([key, value]) => {
			t.deepEqual(R.path([key], noteA), value, `Failed on asserting ${key}`);
		});
		t.truthy(noteA.createdAt instanceof Date);
		t.is(noteA.updatedAt, null);

		const noteB = await connector.create({
			content: {},
			notePosition: parseInt(faker.random.numeric(2)),
		});
		t.truthy(noteB.id > noteA.id);
		t.truthy(noteB.createdAt.getTime() >= noteA.createdAt.getTime());
	}));

test("create_diaryIdNotePositionConstraintViolation", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createNoteConnector(trx);
		const diary = await diaryFactory.create({}, { transient: { trx } });
		const creatingKwargs = {
			notePosition: parseInt(faker.random.numeric(2)),
			diaryId: diary.id,
			content: FAKED_CONTENT,
		};
		await connector.create(creatingKwargs);
		await t.throwsAsync(() => connector.create(creatingKwargs), {
			instanceOf: UniqueIntegrityConstraintViolationError,
		});
	}));

test("update_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createNoteConnector(trx);
		const diary = await diaryFactory.create({}, { transient: { trx } });
		const note = await noteFactory.create({}, { transient: { trx, diary } });
		t.is(note.updatedAt, null);

		const updatingKwargs = {
			id: note.id,
			content: FAKED_CONTENT,
			notePosition: 5,
			sourceUrl: faker.internet.domainName(),
			filePath: faker.internet.domainName(),
			diaryId: undefined,
		};
		const updatedNote = await connector.update(updatingKwargs);

		Object.entries(updatingKwargs).map(([key, value]) => {
			const newValue = value !== undefined ? value : R.path([key], note);
			t.deepEqual(R.path([key], updatedNote), newValue, `Failed on asserting ${key}`);
		});
		t.truthy(updatedNote?.updatedAt instanceof Date);
	}));

test("update_objNotFound", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createNoteConnector(trx);
		await noteFactory.create({}, { transient: { trx } });

		const updatedNote = await connector.update({ id: 1000, content: {} });
		t.truthy(updatedNote === undefined);
	}));

test("getMatchedObjects_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createNoteConnector(trx);
		const diary = await diaryFactory.create({}, { transient: { trx } });
		const anotherDiary = await diaryFactory.create({}, { transient: { trx } });
		const fakedNotes = await Promise.all(
			[1, 2, 3].map((_i) => noteFactory.create({}, { transient: { trx, diary } }))
		);
		const result = await connector.getMatchedObjects(diary.id);
		t.is(result.total, 3);
		fakedNotes.forEach((note) => {
			const queriedNote = result.notes?.find((_note) => _note.id === note.id);
			t.deepEqual(queriedNote, note);
		});

		t.deepEqual(await connector.getMatchedObjects(anotherDiary.id), { total: 0, notes: [] });
	}));

test("delete_happy", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createNoteConnector(trx);
		const notes = await Promise.all([1, 2, 3].map((_i) => noteFactory.create({}, { transient: { trx } })));
		const ids = notes.map((note) => note.id);

		const count = await connector.deleteObjs(ids);
		t.is(count, 3);
	}));

test("delete_objsDoNotExist", async (t) =>
	integrationTestWrapper(async (trx) => {
		const connector = await createNoteConnector(trx);
		const count = await connector.deleteObjs([1, 2, 3]);
		t.is(count, 0);
	}));
