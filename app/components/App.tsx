"use strict";

import React from 'react';
import CorpusViz from './CorpusViz';
import { IS_DEVELOPMENT } from '../helpers/common';


const App = () => {

	return (
		<>

			<header className="app-header">

				<div className="container">

					<div className="app-name">
						Corpus Viz
					</div>

					<nav className="app-navigation">
						<ul className="left">
							<li>
								<a className="active" href="/">Home</a>
							</li>
							{IS_DEVELOPMENT && (
								<li>
									<a href="/another.html">Page without React</a>
								</li>
							)}
						</ul>
					</nav>

				</div>

			</header>

			<CorpusViz />

			<footer className="app-footer">
				<p>
					&copy; 2023 <a href="https://github.com/pokusew">Martin Endler</a>
					{' and '}
					<a href="https://github.com/borisrakovan">Boris Rakovan</a>
					{' | '}
					Source code on <a href="https://github.com/pokusew/fel-corpus-viz">GitHub</a>
				</p>
			</footer>

		</>
	);

};

export default App;
