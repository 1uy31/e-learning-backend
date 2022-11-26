import express, { Request, Response, Express } from 'express';

import { APP_CONFIG } from '@src/config';

const app: Express = express();

app.get('/', (_req: Request, res: Response) => {
	res.send('Hello World!');
});

app.listen(APP_CONFIG.PORT, () => {
	console.log(`[server]: Server is running at ${APP_CONFIG.HOST}:${APP_CONFIG.PORT}`);
});
