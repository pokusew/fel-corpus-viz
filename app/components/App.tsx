"use strict";

import React, { useCallback, useState } from 'react';
import Demo from './Demo';


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
							<li>
								<a href="/another.html">Page without React</a>
							</li>
						</ul>
					</nav>

				</div>

			</header>

			<main className="app-content">
				<div className="container">
					<Demo />
				</div>
			</main>

			<footer className="app-footer">
				<p>
					&copy; 2023 <a href="https://github.com/pokusew">Martin Endler</a>
					{' and '}
					<a href="https://github.com/borisrakovan">Boris Rakovan</a>
				</p>
				<p>Source code on <a href="https://github.com/pokusew/fel-corpus-viz">GitHub</a></p>
			</footer>

		</>
	);

};

export default App;
