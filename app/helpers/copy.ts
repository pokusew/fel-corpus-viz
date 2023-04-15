"use strict";

import { isDefined } from './common';


// https://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
// https://stackoverflow.com/a/30810322/9545525
export const copyOnClick = event => {

	event.stopPropagation();
	event.preventDefault();

	const range = document.createRange();
	range.selectNodeContents(event.target);

	const selection = window.getSelection();

	if (!isDefined(selection)) {
		// note: this should never happen as the selection is created
		//       in range.selectNodeContents(event.target);
		console.error(`[copyOnClick] Error while copying target to clipboard: selection is null`, selection);
		return;
	}

	selection.removeAllRanges();
	selection.addRange(range);

	try {
		const result = document.execCommand('copy');
		if (result) {
			console.log(`[copyOnClick] Copied target to clipboard!`);
		} else {
			console.warn(`[copyOnClick] Unable to copy target to clipboard!`);
		}
	} catch (err) {
		console.error(`[copyOnClick] Error while copying target to clipboard:`, err);
	}

	selection.removeAllRanges();

};
