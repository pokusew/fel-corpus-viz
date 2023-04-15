"use strict";


export const isDefined = v => v !== undefined && v !== null;

export const templateParameters = (compilation, assets, assetTags, options) => {

	// // https://webpack.js.org/api/logging/
	const logger = compilation.compiler.getInfrastructureLogger('./tools/webpack-utils/templateParameters');

	const manifest = compilation.getAssets().find(asset => /manifest\.[^.]+\.imt\.json$/.test(asset.name));

	if (!isDefined(manifest)) {
		throw new Error('manifest.json not found in the assets');
	}

	const data = {
		rel: 'manifest',
		href: assets.publicPath + manifest.name,
	};

	if (typeof manifest.source.integrity === 'string') {
		data.integrity = manifest.source.integrity;
	}

	if (typeof compilation.options.output.crossOriginLoading === 'string') {
		data.crossorigin = compilation.options.output.crossOriginLoading;
	}

	const tag = `<link${
		Object.entries(data)
			.reduce((acc, [key, value]) => acc + (` ${key}="${value}"`), '')
	} />`;

	// https://webpack.js.org/api/logging/
	logger.info('generated manifest tag:', tag);

	return {
		compilation: compilation,
		webpackConfig: compilation.options,
		htmlWebpackPlugin: {
			tags: assetTags,
			files: assets,
			options: options,
		},
		manifest: {
			tag,
			data,
		},
	};

};
