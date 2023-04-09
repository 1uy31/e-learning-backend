const exec = require("child_process").exec;

const sh = async (/** @type {string} */ cmd) =>
	new Promise((resolve, reject) =>
		exec(cmd, (err, stdout, stderr) => {
			if (err) {
				reject(err);
			} else {
				resolve({ stdout, stderr });
			}
		})
	);

const runMigration = async () => {
	await sh("sqitch deploy db:pg://p0stgr3s:p0stgr3s@localhost:5432/e_learning_test");
};

runMigration();
