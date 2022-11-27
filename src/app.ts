import express, { Request, Response, Express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';

import { APP_CONFIG } from '@src/config';

const app: Express = express();
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// The root provides a resolver function for each API endpoint
const root = {
	hello: () => {
		return 'Hello world!';
	},
};

app.get('/', (_req: Request, res: Response) => {
	res.send('Hello World!');
});

app.use(
	'/graphql',
	graphqlHTTP({
		schema: schema,
		rootValue: root,
		graphiql: true,
	})
);

app.listen(APP_CONFIG.PORT, () => {
	console.log(`[server]: Server is running at ${APP_CONFIG.HOST}:${APP_CONFIG.PORT}`);
	console.log(`[server]: GraphQL API server is running at ${APP_CONFIG.HOST}:${APP_CONFIG.PORT}/graphql`);
});
