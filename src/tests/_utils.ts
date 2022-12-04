import { DatabaseTransactionConnection } from "slonik";
import { getDbPool } from "@src/database";

type TestFunction = (connection: DatabaseTransactionConnection) => Promise<void>;

export const integrationTestWrapper = async (testFunction: TestFunction) => {
	const db = await getDbPool();
	await db.connect(async (connection) =>
		connection
			.transaction(async (trx) =>
				testFunction(trx)
					.then(() => {
						throw new Error("Intentionally rolling back the transaction");
					})
					.catch((err) => {
						throw err;
					})
			)
			.catch((err) => {
				if (err.message !== "Intentionally rolling back the transaction") {
					throw err;
				}
			})
	);
};
