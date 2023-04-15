# fel-corpus-viz

Visualization of a document corpus using D3.js

👉 Available online at [pokusew-corpus-viz.netlify.app](https://pokusew-corpus-viz.netlify.app/)

The code is written in **[TypeScript]**, **[D3.js]** and **[React.js]**.
See more in the [Architecture](#architecture) section.

🚧 **Note:** This is work in progress.


## Content

<!-- **Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)* -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Description](#description)
- [Architecture](#architecture)
	- [Project structure](#project-structure)
- [Development](#development)
	- [Requirements](#requirements)
	- [Set up](#set-up)
	- [Available commands](#available-commands)
- [Deployment](#deployment)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Description

TODO


## Architecture

_Currently_, it is a client-side-only application (SPA).
**It runs completely in the browser**.

The code is written in **[TypeScript]**, **[D3.js]** and **[React.js]**.

The project has [just a few production dependencies](./package.json#L31-L35).
Everything else is implemented from scratch.


### Project structure

The web app source code is in the [app](./app) directory.
Some directories contain feature-specific READMEs.
The following diagram briefly describes the main directories and files:

```text
. (project root dir)
├── .github - GitHub config (GitHub Actions)
├── app - the app source code
│   ├── ...
│   ├── _headers - Netlify HTTP headers customization
│   ├── _redirects - Netlify HTTP redirects/rewrites customization
│   ├── index.js - the app starting point
│   ├── manifest.json - a web app manifest for PWA
│   ├── robots.txt
│   ├── routes.ts - app routes definitions
│   ├── template.ejs - index.html template to be built by webpack 
│   └── types.js - data, state and API types
├── data-preprocessing - Python scripts used for data preprocessing
├── test - a few tests
├── tools - custom webpack plugins
├── types - TypeScript declarations for non-code imports (SVG, MP3)
├── .browserslistrc - Browserslist config
├── .eslintrc.js - ESLint config
├── .nvmrc - Node.js version specification for Netlify
├── ava.config.js - AVA config
├── babel.config.js - Babel config
├── netlify.toml - Netlify main config
├── package.json
├── babel.config.js - PostCSS config
├── tsconfig.json - main TypeScript config
├── webpack.config.*.js - webpack configs
└── yarn.lock
```


## Development


### Requirements

- [Node.js] >=18.x
- [Yarn][Yarn-v1] 1.x
- You can follow [this Node.js Development Setup guide](./NODEJS-SETUP.md).


### Set up

1. Install all dependencies with Yarn (run `yarn`).
2. You are ready to go.
3. Use `yarn start` to start dev server with HMR.
4. Then open `http://localhost:3000/` in the browser.


### Data preprocessing

The data preprocessing is done in Python 3.9 and all the scripts are part of this repository.
The scripts are located in the [data-preprocessing](./data-preprocessing) directory.

To run the current version of the preprocessing pipeline:

1. Change into the `data-preprocessing` dir: `cd data-preprocessing`
2. Download the data of some corpus from [here](https://archive.ics.uci.edu/ml/datasets/Bag+of+Words).
3. Create and activate a new virtual environment (optional).
4. Install the dependencies using [Poetry] (`poetry install`) or [pip] (`python -m pip install .`) 
5. Run the `main.py` script, for example like this:
```bash
python main.py --corpus_name kos --preprocess bow --method pca --save_figure
```


### Available commands

* `yarn start` – Starts a webpack development server with [HMR (hot module replacement)][webpack-hmr].

* `yarn build` – Builds the production version and outputs to `dist` dir. Note: Before running an actual
  build, `dist` dir is purged.

* `yarn analyze` – Same as `yarn build` but it also outputs `build/stats.production.json`
  and runs [webpack-bundle-analyzer CLI][webpack-bundle-analyzer-cli].

* `yarn tsc` – Runs TypeScript compiler. Outputs type errors to console.

* `yarn lint` – Runs [ESLint]. Outputs errors to console.

* `yarn test` – Runs tests using [AVA].

* `yarn test-hot` – Runs tests using [AVA] in watch mode.


## Deployment

_Currently_, we use [Netlify] which is practically a CDN on steroids with integrated
builds. There are 3 configuration files that affect the deployment behavior:

* [netlify.toml](./netlify.toml) – global config
* [app/_headers](./app/_headers) – HTTP headers customization (mainly for immutable files)
* [app_redirects](./app/_redirects) – HTTP redirects and rewrites (fallback to index.html for client-side
  routing)


<!-- links references -->

[pokusew/testbook-ocr]: https://github.com/pokusew/testbook-ocr

[D3.js]: https://d3js.org/

[React.js]: https://reactjs.org/

[react-intl]: https://formatjs.io/docs/react-intl/

[classnames]: https://github.com/JedWatson/classnames

[firebase-cloud-firestore]: https://firebase.google.com/docs/firestore

[PWA]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

[History API]: https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API

[Intl API]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl

[AVA]: https://github.com/avajs/ava

[Netlify]: https://www.netlify.com/

[Node.js]: https://nodejs.org/en/

[Yarn-v1]: https://classic.yarnpkg.com/lang/en/

[webpack]: https://webpack.js.org/

[webpack-hmr]: https://webpack.js.org/guides/hot-module-replacement/

[webpack-bundle-analyzer-cli]: https://github.com/webpack-contrib/webpack-bundle-analyzer#usage-as-a-cli-utility

[Babel]: https://babeljs.io/

[Sass]: https://sass-lang.com/

[Autoprefixer]: https://github.com/postcss/autoprefixer

[Browserslist]: https://github.com/browserslist/browserslist

[TypeScript]: https://www.typescriptlang.org/

[ESLint]: https://eslint.org/

[mdn-progressive-enhancement]: https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement

[mdn-sri]: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity

[web-dev-maskable-icons]: https://web.dev/maskable-icon/

[Potery]: https://python-poetry.org/

[pip]: https://pypi.org/project/pip/
