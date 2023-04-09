import "dotenv/config";

export const APP_CONFIG = {
	DATABASE_URL: process.env.DATABASE_URL,
	HOST: process.env.HOST,
	PORT: process.env.PORT,
};
