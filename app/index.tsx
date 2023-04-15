"use strict";

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './compoments/App';

import './styles/main.scss';
import './robots.txt';
import './_redirects';
import './_headers';
import './manifest.json';


// TODO: re-enable before release
// registerServiceWorker();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
