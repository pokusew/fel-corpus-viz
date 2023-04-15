"use strict";

import React, { useCallback, useState } from 'react';


const Demo = () => {

	const [counter, setCounter] = useState<number>(0);

	const handleClick = useCallback((event) => {
		setCounter(prevValue => prevValue + 1);
	}, [setCounter]);

	return (
		<>

			<h1>Demo</h1>

			<p>Number clicks: {counter}</p>

			<button
				type="button"
				onClick={handleClick}
			>
				Click on me!
			</button>

		</>
	);

};

export default Demo;
