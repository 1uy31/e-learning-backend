import {
	createPool,
	DatabaseTransactionConnection,
	IdentifierSqlToken,
	sql,
	ValueExpression,
	DatabasePool,
	DatabasePoolConnection,
} from "slonik";
import { APP_CONFIG } from "@src/config";
import { createResultParserInterceptor } from "@database/interceptors";
import { z } from "zod";
import { isDefined } from "@src/utils";
import { createCategoryObj, updateCategoryObj } from "@database/categoryObjects";
import { createDiaryObj, updateDiaryObj } from "@database/diaryObjects";
import { createNoteObj, updateNoteObj } from "@database/noteObjects";
import { countObj } from "@database/baseObjects";

const SCHEMA_NAME = "e_learning_schema";
export const CATEGORY_TABLE = sql.identifier([SCHEMA_NAME, "category"]);
export const DIARY_TABLE = sql.identifier([SCHEMA_NAME, "diary"]);
export const NOTE_TABLE = sql.identifier([SCHEMA_NAME, "note"]);

export type SqlConnection = DatabasePool | DatabasePoolConnection | DatabaseTransactionConnection;

export const getDbPool = async () =>
	await createPool(APP_CONFIG.DATABASE_URL || "", {
		interceptors: [createResultParserInterceptor()],
	});

type InsertingParser = typeof createCategoryObj | typeof createDiaryObj | typeof createNoteObj;

/**
 * Using the parser (zod object) to parse the input and filter out undefined values.
 * It returns:
 * {
 * 		values: A list of defined values,
 * 		keys: A list of keys corresponding to the above values
 * }
 */
const parseInput = <T extends InsertingParser>(parser: T, input: z.input<T>) => {
	const parsedInput = parser.parse(input);
	const keys = Object.entries(parsedInput)
		.filter(([_key, value]) => isDefined(value))
		.map(([key, _value]) => key);

	const values = Object.values(parsedInput)
		.filter(isDefined)
		.map((value) => {
			if (typeof value === "object") {
				return sql.jsonb(value);
			}
			return value;
		});

	return {
		keys,
		values,
	};
};

/**
 * Using the parser (zod object) to parse the input and filter out undefined values.
 * It returns:
 * {
 * 		columns: comma separated columns usable in SQL query
 * 		values: comma separated values usable in SQL query
 */
export const parseInsertingData = <T extends InsertingParser>(parser: T, input: z.input<T>) => {
	const { keys: keysToInsert, values: valuesToInsert } = parseInput(parser, input);
	const identifiers = keysToInsert.map((key) => sql.identifier([key]));
	const columns = sql.join(identifiers, sql.fragment`, `);
	const values = sql.join(valuesToInsert, sql.fragment`, `);
	return {
		columns,
		values,
	};
};

type UpdatingParser = typeof updateCategoryObj | typeof updateDiaryObj | typeof updateNoteObj;

/**
 * Using the parser (zod object) to parse the input and filter out undefined values.
 * It returns:
 * {
 * 		id: the ID of the object to be updated
 * 		dataSetter: comma separated column=value pairs usable for SET command in SQL query
 */
export const parseUpdatingData = <T extends UpdatingParser>(parser: T, input: z.input<T>) => {
	const parsedInput = parser.parse(input);
	const { id, ...restOfInput } = parsedInput;

	const keysToUpdate = Object.entries(restOfInput)
		.filter(([_key, value]) => isDefined(value))
		.map(([key, _value]) => key);

	const valuesToUpdate: Array<ValueExpression> = Object.values(restOfInput)
		.filter(isDefined)
		.map((value) => {
			if (typeof value === "object") {
				return sql.jsonb(value);
			}
			return value;
		});

	const dataSetter = sql.join(
		keysToUpdate.map((column, idx) => {
			return sql.fragment`${sql.identifier([column])} = ${valuesToUpdate[idx]}`;
		}),
		sql.fragment`,`
	);

	return {
		id,
		dataSetter,
	};
};

/**
 * Delete from the database table all the objects with ID in the ids and return the number of deleted objects.
 */
export const deleteDbObjs = async (db: SqlConnection, table: IdentifierSqlToken, ids: Array<number>) => {
	const uniqueIds = [...new Set(ids)];
	const raw = await db.query(
		sql.type(countObj)`
			WITH deleted AS (
			    DELETE FROM ${table} WHERE id IN (${sql.join(uniqueIds, sql.fragment`, `)}) 
				RETURNING *
			) SELECT COUNT(*) FROM deleted;
			`
	);
	return raw.rows[0].count;
};
