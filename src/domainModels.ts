export type Base = {
	id: number;
	createdAt: Date;
	updatedAt: Date | null;
};

export type Category = Base & {
	name: string;
};

export type Diary = Base & {
	topic: string;
	sourceUrl: string | null;
	reviewCount: number;
	rate: number | null;
	categoryId: number | null;
};

export type Note = Base & {
	notePosition: number;
	imageUrl: string | null;
	sourceUrl: string | null;
	diaryId: number | null;
};
