import { Note, createNoteConnector } from "@database/noteConnector";
import { JsonType } from "@database/baseObjects";

export type NoteService = {
	getMatchedObjects: (
		_obj: never,
		kwargs: { diaryId?: number; diaryIds?: Array<number>; limit?: number; offset?: number }
	) => Promise<{ total: number; notes: Readonly<Array<Note>> }>;
	create: (
		_obj: never,
		kwargs: {
			notePosition: number;
			content?: JsonType;
			sourceUrl?: string;
			filePath?: string;
			diaryId?: number;
		}
	) => Promise<Note>;
};

export const createNoteService = (): NoteService => {
	const getMatchedObjects = async (
		_obj: undefined,
		kwargs: { diaryId?: number; diaryIds?: Array<number>; limit?: number; offset?: number }
	) => {
		const noteConnector = await createNoteConnector();
		const notes = await noteConnector.getMatchedObjects(
			kwargs.diaryId,
			kwargs.diaryIds,
			kwargs.limit,
			kwargs.offset
		);
		return notes;
	};

	const create = async (
		_obj: undefined,
		kwargs: {
			notePosition: number;
			content?: JsonType;
			sourceUrl?: string;
			filePath?: string;
			diaryId?: number;
		}
	) => {
		const noteConnector = await createNoteConnector();
		const noteData = {
			notePosition: kwargs.notePosition,
			content: kwargs.content || {},
			sourceUrl: kwargs.sourceUrl || null,
			filePath: kwargs.filePath || null,
			diaryId: kwargs.diaryId || null,
		};
		const note = await noteConnector.create(noteData);
		return note;
	};

	return {
		getMatchedObjects,
		create,
	};
};
