import GraphQLJSON from "graphql-type-json";

/**
 * Global typedef for extends of Query and Mutation
 */
export const globalTypeDef = `
  scalar Date
  
  scalar JSON

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

export const globalResolver = {
	JSON: GraphQLJSON,
};
