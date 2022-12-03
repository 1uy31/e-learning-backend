module.exports = {
	parser: "@typescript-eslint/parser", // Specifies the ESLint parser
	plugins: ["@typescript-eslint"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
	],
	parserOptions: {
		ecmaVersion: 2019, // Allows for the parsing of modern ECMAScript features
		sourceType: "module", // Allows for the use of imports
	},
	rules: {
		// Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
		// e.g. "@typescript-eslint/explicit-function-return-type": "off",
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": [
			"warn",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
			},
		],
		"prettier/prettier": [
			"error",
			{
				singleQuote: false,
				semi: true,
				avoidEscape: true,
				allowTemplateLiterals: true,
			},
		],
	},
};
