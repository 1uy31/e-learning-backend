import { Note, createNoteConnector } from "@database/noteConnector";
import { JsonType } from "@database/baseObjects";

export type NoteService = {
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
		create,
	};
};
