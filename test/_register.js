"use strict";

// this transpiles (only source code, not test files) on the fly
// https://babeljs.io/docs/en/babel-register
require('@babel/register')({
	// this will cause babel.config.js from project root to be used
	// it is configured to transpile only source code, not test files
	rootMode: 'upward',
	extensions: ['.js', '.ts', '.tsx'],
});
