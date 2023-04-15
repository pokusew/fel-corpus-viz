"use strict";

// see https://webpack.js.org/api/loaders/
// see https://webpack.js.org/contribute/writing-a-loader/
module.exports = function (source) {

	const callback = this.async();

	const manifest = JSON.parse(source);

	const work = manifest.icons
		? manifest.icons.map(icon => {

			return new Promise(((resolve, reject) => {

				// Cannot use this.loadModule with webpack 5.x Assets Modules here (but file-loader works),
				// see https://github.com/webpack/webpack/issues/13552.
				// Surprisingly, importModule works.
				this.importModule(`${icon.src}`, {}, (err, result) => {

					if (err) {
						reject(err);
						return;
					}

					const path = result;

					icon.src = path;

					resolve();

				});

			}));

		})
		: [];

	Promise.all(work)
		.then(() => {
			callback(null, JSON.stringify(manifest) + '\n');
		})
		.catch(err => {
			callback(err, JSON.stringify(manifest) + '\n');
		});

};
