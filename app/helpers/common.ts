"use strict";

// user defined type guard, which guarantees 'object is T', not undefined, not null
// see https://2ality.com/2020/06/type-guards-assertion-functions-typescript.html#user-defined-type-guards
export const isDefined = <T>(object: T | undefined | null): object is T =>
	object !== undefined && object !== null;

export const isEmpty = <T>(value: T | undefined | null | ''): value is undefined | null | '' =>
	!isDefined(value) || value === '';

// maybe constants are better than  "functions"
// reason: the value of process.env.NODE_ENV is cached, and repeatedly used instead of reading process.env
//         process.env is NOT a regular object and reading it repeatedly is slow
//         see https://github.com/facebook/react/issues/812
export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
export const IS_TEST: boolean = process.env.NODE_ENV === 'test';
// export const isProduction = (): boolean => process.env.NODE_ENV === 'production';
// export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
// export const isTest = (): boolean => process.env.NODE_ENV === 'test';
