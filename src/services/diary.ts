import { Diary, createDiaryConnector } from "@database/diaryConnector";

export type DiaryService = {
	getMatchedObjects: (
		_obj: never,
		kwargs: { topic?: string; categoryId?: number; categoryName?: string; parentDiaryId?: number }
	) => Promise<Readonly<Array<Diary>>>;
	create: (
		_obj: never,
		kwargs: { topic: string; sourceUrl?: string; rate?: number; categoryId?: number; parentDiaryId?: number }
	) => Promise<Diary>;
};

export const createDiaryService = (): DiaryService => {
	const getMatchedObjects = async (
		_obj: undefined,
		kwargs: { topic?: string; categoryId?: number; categoryName?: string; parentDiaryId?: number }
	) => {
		const diaryConnector = await createDiaryConnector();
		const diaries = await diaryConnector.getMatchedObjects(
			kwargs.topic,
			kwargs.categoryId,
			kwargs.categoryName,
			kwargs.parentDiaryId
		);
		return diaries;
	};

	const create = async (
		_obj: undefined,
		kwargs: { topic: string; sourceUrl?: string; rate?: number; categoryId?: number; parentDiaryId?: number }
	) => {
		const diaryConnector = await createDiaryConnector();
		const diaryData = {
			topic: kwargs.topic,
			sourceUrl: kwargs.sourceUrl || null,
			rate: kwargs.rate || null,
			categoryId: kwargs.categoryId || null,
			parentDiaryId: kwargs.parentDiaryId || null,
		};
		const diary = await diaryConnector.create(diaryData);
		return diary;
	};

	return {
		getMatchedObjects,
		create,
	};
};
