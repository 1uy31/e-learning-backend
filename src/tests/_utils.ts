import { DatabaseTransactionConnection } from "slonik";
import { getDbPool } from "@src/database";

type TestFunction = (connection: DatabaseTransactionConnection) => Promise<void>;

export const integrationTestWrapper = async (testFunction: TestFunction) => {
	const db = await getDbPool();
	db.connect(async (connection) => {
		connection
			.transaction(async (trx) => {
				await testFunction(trx);
				/* To rollback transaction at the end of the test. */
				throw new Error();
			})
			.then((_r) => ({}))
			.catch((_err) => ({}));
	}).then((_r) => ({}));
};
