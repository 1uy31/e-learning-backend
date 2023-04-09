import { APP_CONFIG } from "@src/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { globalTypeDef } from "@schemata/index";
import { categoryResolver, categoryTypedef } from "@schemata/category";

const server = new ApolloServer({
	typeDefs: [globalTypeDef, categoryTypedef],
	resolvers: categoryResolver,
});

let url;
startStandaloneServer(server, {
	listen: { port: APP_CONFIG.PORT ? Number(APP_CONFIG.PORT) : 8000 },
}).then((value) => {
	url = value.url;
	console.log(`🚀 Server ready at: ${url}`);
});
