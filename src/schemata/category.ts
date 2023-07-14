import { createCategoryService } from "@services/category";

const categoryService = createCategoryService();

export const categoryTypedef = `
  type Category {
    id: Int
    name: String
    createdAt: Date
    updatedAt: Date
  }
  
  type ExtendedCategory {
    id: Int
    name: String
    createdAt: Date
    updatedAt: Date
    noParentDiaryCount: Int
  }
  
  type Categories {
    total: Int
    categories: [ExtendedCategory]
  }
  
  extend type Query {
  
    categories (
    	name: String
        limit: Int
        offset: Int
    ): Categories
    
  }
  
  extend type Mutation {
  
    addCategory (
        name: String!
    ): Category
    
  }
`;

export const categoryResolver = {
	Query: {
		categories: categoryService.getAll,
	},
	Mutation: {
		addCategory: categoryService.create,
	},
};
