"use strict";

import test from 'ava';


test('simple', t => {

	const a: number = 5;
	const b: number = 8;

	t.assert(a < b, 'a must be less than b');

});
