import { DatabasePoolConnection } from "slonik";
import { getDbPool } from "@src/database";

type TestFunction = (connection: DatabasePoolConnection) => Promise<void>;

export const integrationTestWrapper = async (testFunction: TestFunction) => {
	const db = await getDbPool();
	db.connect(async (connection) => {
		await testFunction(connection);

		try {
			/* To rollback transaction at the end of the test. */
			throw new Error();
		} catch (_err) {
			/* empty */
		}
	}).then((_r) => ({}));
};
