// see https://github.com/jhamlet/svg-react-loader/issues/104#issuecomment-429767794
// see https://stackoverflow.com/questions/51725002/false-positive-typescript-cannot-find-module-warning
declare module '*.svg' {

	import React, { HTMLAttributes } from 'react';

	// TODO: does not work
	// const value: React.ComponentType<HTMLAttributes<SVGElement>>;
	// const value: JSX.IntrinsicElements['svg'];
	const value: any;

	export default value;

}
