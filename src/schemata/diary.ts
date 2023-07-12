import { createDiaryService } from "@services/diary";

const diaryService = createDiaryService();

export const diaryTypedef = `
  type Diary {
    id: Int
    topic: String
    sourceUrl: String
    rate: Int
    reviewCount: Int
    categoryId: Int
    diaryParentId: Int
    createdAt: Date
    updatedAt: Date
  }

  extend type Query {
  
    diaries (
    	topic: String
        categoryId: Int
        categoryName: String
    ): [Diary]
    
  }
  
  extend type Mutation {
  
    addDiary (
        topic: String!
        sourceUrl: String
        rate: Int
        categoryId: Int
        diaryParentId: Int
    ): Diary
    
  }
`;

export const diaryResolver = {
	Query: {
		diaries: diaryService.getByCategorizedTopic,
	},
	Mutation: {
		addDiary: diaryService.create,
	},
};
