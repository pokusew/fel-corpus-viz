"use strict";


// global mutable counter
// useful for debugging during development

let value = 0;

const values = new Map<string, number>();

export const getIntAndIncrement = (scope): number => {

	if (scope === undefined) {
		return value++;
	}

	const scopedValue = values.get(scope) ?? 0;

	values.set(scope, scopedValue + 1);

	return scopedValue;

};
