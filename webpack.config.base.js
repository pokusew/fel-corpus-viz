"use strict";

import path from 'path';


export default {

	// file-loader is deprecated for webpack v5
	// webpack Asset Modules is the recommended solution
	//   see https://github.com/webpack-contrib/file-loader
	//   see https://webpack.js.org/guides/asset-modules/

	module: {
		rules: [
			{
				test: /robots\.txt$/,
				// see https://webpack.js.org/guides/asset-modules/
				type: 'asset/resource',
				generator: {
					// [ext] already contains the dot (.)
					filename: '[name][ext]',
				},
				include: [
					path.resolve(__dirname, 'app'),
				],
			},
			{
				test: /_(redirects|headers)$/,
				// see https://webpack.js.org/guides/asset-modules/
				type: 'asset/resource',
				generator: {
					filename: '[name]',
				},
				include: [
					path.resolve(__dirname, 'app'),
				],
			},
			{
				test: /manifest.json$/,
				// see https://webpack.js.org/guides/asset-modules/
				type: 'asset/resource',
				generator: {
					// [ext] already contains the dot (.)
					filename: '[name].[contenthash].imt[ext]',
				},
				use: [
					'web-app-manifest-loader',
				],
				include: [
					path.resolve(__dirname, 'app'),
				],
			},
			// {
			// 	test: /\.mjs$/,
			// 	type: 'javascript/auto',
			// },
			{
				test: /\.(ts|js)x?$/,
				loader: 'babel-loader',
				options: {
					cacheDirectory: true,
				},
				include: [
					path.resolve(__dirname, 'app'),
				],
			},
			{
				test: /\.(png|jpg|mp3)$/,
				// see https://webpack.js.org/guides/asset-modules/
				type: 'asset/resource',
				generator: {
					// [ext] already contains the dot (.)
					filename: '[name].[contenthash].imt[ext]',
				},
				include: [
					path.resolve(__dirname, 'app'),
				],
			},
			// bundle .txt files from the app/data directory
			// this is a temporary solution and will be replaced by a more robust file serving mechanism in the future
			{
				test: /\.txt$/,
				// see https://webpack.js.org/guides/asset-modules/
				type: 'asset/resource',
				generator: {
					// [ext] already contains the dot (.)
					filename: '[name].[contenthash].imt[ext]',
				},
				include: [
					path.resolve(__dirname, 'app/data'), // Update the include path to 'app/data'
				],
			},
		],
	},

	// https://github.com/webpack/webpack/issues/11660
	target: 'web', // default is browserslist

	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},

	resolveLoader: {
		modules: [
			'node_modules',
			path.resolve(__dirname, 'tools'),
		],
	},

	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].js',
		// see https://webpack.js.org/configuration/output/#outputhashdigestlength
		// hashDigestLength,
		// see https://webpack.js.org/configuration/output/#outputhashfunction
		// hashFunction,
	},

	plugins: [],

	optimization: {
		moduleIds: 'named',
		// minimize: false, // (true by default for production) https://github.com/babel/minify probably does not work (outputs are even bigger)
	},

};
