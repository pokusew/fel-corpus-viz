"use strict";

// READ https://www.robertcooper.me/using-eslint-and-prettier-in-a-typescript-project

// TODO: consider Prettier

// see also https://palantir.github.io/tslint/
// see also https://eslint.org/
// see also https://github.com/typescript-eslint/typescript-eslint

// docs:
// - https://github.com/yannickcr/eslint-plugin-react
// - https://github.com/facebook/react/tree/master/packages/eslint-plugin-react-hooks

// config based on https://www.robertcooper.me/using-eslint-and-prettier-in-a-typescript-project
module.exports = {
	parser: '@typescript-eslint/parser', // Specifies the ESLint parser
	parserOptions: {
		ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
		sourceType: 'module', // Allows for the use of imports
		ecmaFeatures: {
			jsx: true, // Allows for the parsing of JSX
		},
	},
	settings: {
		react: {
			version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
		},
	},
	extends: [

		// TODO: check that the following order is correct as the order probably matters

		// TODO: gradually pick and enable rules from these two plugins
		// 'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
		// 'plugin:@typescript-eslint/recommended' // Uses the recommended rules from @typescript-eslint/eslint-plugin

		'plugin:react-hooks/recommended',

	],
	rules: {
		// Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
		// e.g. '@typescript-eslint/explicit-function-return-type': 'off',
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'error', // note: default value for this rule is warn
	},
};
