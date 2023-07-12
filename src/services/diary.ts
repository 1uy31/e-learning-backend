import { Diary, createDiaryConnector } from "@database/diaryConnector";

export type DiaryService = {
	getByCategorizedTopic: (
		_obj: never,
		kwargs: { topic?: string; categoryId?: number; categoryName?: string }
	) => Promise<Readonly<Array<Diary>>>;
	create: (
		_obj: never,
		kwargs: { topic: string; sourceUrl?: string; rate?: number; categoryId?: number; diaryParentId?: number }
	) => Promise<Diary>;
};

export const createDiaryService = (): DiaryService => {
	const getByCategorizedTopic = async (
		_obj: undefined,
		kwargs: { topic?: string; categoryId?: number; categoryName?: string }
	) => {
		const diaryConnector = await createDiaryConnector();
		const diaries = await diaryConnector.getByCategorizedTopic(
			kwargs.topic,
			kwargs.categoryId,
			kwargs.categoryName
		);
		return diaries;
	};

	const create = async (
		_obj: undefined,
		kwargs: { topic: string; sourceUrl?: string; rate?: number; categoryId?: number; diaryParentId?: number }
	) => {
		const diaryConnector = await createDiaryConnector();
		const diaryData = {
			topic: kwargs.topic,
			sourceUrl: kwargs.sourceUrl || null,
			rate: kwargs.rate || null,
			categoryId: kwargs.categoryId || null,
			diaryParentId: kwargs.diaryParentId || null,
		};
		const diary = await diaryConnector.create(diaryData);
		return diary;
	};

	return {
		getByCategorizedTopic,
		create,
	};
};
