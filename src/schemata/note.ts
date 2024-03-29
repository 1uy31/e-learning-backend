import { createNoteService } from "@services/note";

const noteService = createNoteService();

export const noteTypedef = `
  type Note {
    id: Int
    notePosition: Int
    content: JSON
    sourceUrl: String
    filePath: String
    diaryId: Int
    createdAt: Date
    updatedAt: Date
  }
  
  type Notes {
    total: Int
    notes: [Note]
  }

  extend type Query {
  
    notes (
        diaryId: Int
        diaryIds: [Int]
        limit: Int
        offset: Int
    ): Notes
    
  }
  
  extend type Mutation {
  
    addNote (
		notePosition: Int
		content: JSON
		sourceUrl: String
		filePath: String
		diaryId: Int
    ): Note
    
  }
`;

export const noteResolver = {
	Query: {
		notes: noteService.getMatchedObjects,
	},
	Mutation: {
		addNote: noteService.create,
	},
};
