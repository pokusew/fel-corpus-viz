"use strict";

// Babel config for both web and Node.js


// console.log(process.env.NODE_ENV);
// console.log(process.env.BROWSERSLIST_ENV);

const isDefined = value => value !== undefined && value !== null;

const isWebpack = caller => caller?.name === 'babel-loader' && caller?.target === 'web';

const determineBrowserslistEnv = (api) => {

	const browserslistEnv = isDefined(process.env.BROWSERSLIST_ENV)
		? process.env.BROWSERSLIST_ENV
		: api.caller(isWebpack) ? 'production' : 'test';

	// use stderr to not affect stdout capture
	process.stderr.write(`browserslistEnv = '${browserslistEnv}'\n`);

	return browserslistEnv;

};

module.exports = api => ({
	presets: [
		[
			'@babel/preset-env',
			{
				// targets are provided by Browserslist
				// see https://babeljs.io/docs/en/babel-preset-env#browserslist-integration
				browserslistEnv: determineBrowserslistEnv(api),
				useBuiltIns: 'usage',
				corejs: 3,
				debug: false,
			},
		],
		'@babel/preset-typescript',
		'@babel/preset-react',
	],
	plugins: [
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-proposal-export-default-from',
	],
	env: {
		production: {
			presets: [],
			plugins: [],
		},
		test: {
			presets: [],
			plugins: [],
		},
		development: {
			presets: [],
			plugins: api.caller(isWebpack)
				? ['react-refresh/babel']
				: [],
		},
	},
	ignore: [
		'**/*.no-babel.js',
		/node_modules/,
		'**/dist',
	],
	sourceMaps: true,
});
