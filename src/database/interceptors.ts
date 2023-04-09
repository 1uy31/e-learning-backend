import { Interceptor, SchemaValidationError } from "slonik";

/**
 * An interceptor to convert object in the format used in PostgreSQL database to the format used in TypeScript.
 * For examples,
 * - Keys are converted from snake case to camel case.
 * - Datetime values are converted from number to TypeScript object.
 * - etc.
 */
export const createResultParserInterceptor = (): Interceptor => {
	return {
		transformRow: (executionContext, actualQuery, row, fields) => {
			const { resultParser } = executionContext;

			if (!resultParser || !row) {
				return row;
			}

			const validationResult = resultParser.safeParse(row);

			if (!validationResult.success) {
				throw new SchemaValidationError(actualQuery, fields, validationResult.error.issues);
			}

			return validationResult.data;
		},
	};
};
