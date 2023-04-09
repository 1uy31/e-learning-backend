import { createCategoryService } from "@services/category";

const categoryService = createCategoryService();

export const categoryTypedef = `
  type Category {
    id: Int
    name: String
    createdAt: Date
    updatedAt: Date
  }
  
  type Categories {
    total: Int
    data: [Category]
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
