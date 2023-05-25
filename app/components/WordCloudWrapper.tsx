import React, {
	forwardRef,
	MouseEventHandler,
	RefCallback,
	useCallback,
	useEffect,
	useId,
	useImperativeHandle,
	useRef,
} from 'react';

import { IS_DEVELOPMENT } from '../helpers/common';
import { getIntAndIncrement } from '../helpers/counter';
import { DatasetDocument } from '../core/types';
import { ResetZoomButton } from './common';
import { SelectedWords } from '../core/scatterplot';
import { WordCloud } from '../core/wordcloud';


export interface WordCloudWrapperProps {
	document: DatasetDocument;
	onSelectedWordsChange: (points: SelectedWords) => void;
	selectedWords: SelectedWords;
	commonWords: SelectedWords;
}

export const WordCloudWrapper = forwardRef((
	{
		document,
		onSelectedWordsChange,
		selectedWords,
		commonWords,
	}: WordCloudWrapperProps,
	ref,
) => {

	const id = useId();
	const plotRef = useRef<WordCloud | null>(null);

	useImperativeHandle(ref, () => {
		const initId = getIntAndIncrement('WordCloudWrapper:useImperativeHandle');
		IS_DEVELOPMENT && console.log(
			`[WCWr][${id}] useImperativeHandle ${initId} callback invocation`,
			plotRef.current != null,
		);
		return plotRef.current;
	}, [id]);

	// see https://react.dev/reference/react-dom/components/common#ref-callback
	// see https://julesblom.com/writing/ref-callback-use-cases
	const handleWrapperElemRefChange: RefCallback<HTMLDivElement> = useCallback((elem) => {

		IS_DEVELOPMENT && console.log(
			`[WCWr][${id}] handleWrapperElemRefChange ref callback invocation`,
			// elem, plotRef.current,
		);

		if (elem instanceof HTMLDivElement) {
			if (plotRef.current !== null) {
				IS_DEVELOPMENT && console.error(
					`[WCWr][${id}] handleWrapperElemRefChange unexpected state:`,
					`elem instanceof HTMLDivElement && plotRef.current !== null`,
					elem, plotRef.current,
				);
				return;
			}
			plotRef.current = new WordCloud(elem);
			return;
		}

		const plot = plotRef.current;
		if (plot === null) {
			IS_DEVELOPMENT && console.error(
				`[WCWr][${id}] handleWrapperElemRefChange unexpected state:`,
				`elem === null && plotRef.current !== null`,
				elem, plotRef.current,
			);
			return;
		}

		plot.destroy();
		plotRef.current = null;

	}, [id]);

	const handleResetZoom = useCallback<MouseEventHandler<HTMLButtonElement>>((event) => {

		event.preventDefault();

		if (!(plotRef.current instanceof WordCloud)) {
			IS_DEVELOPMENT && console.error(`[WCWr] handleResetZoom missing plotRef.current`);
			return;
		}

		plotRef.current.resetZoom();

	}, []);

	useEffect(() => {

		if (!(plotRef.current instanceof WordCloud)) {
			return;
		}

		plotRef.current.setSelectedWordsChangeHandler(onSelectedWordsChange);

	}, [onSelectedWordsChange]);

	useEffect(() => {

		if (!(plotRef.current instanceof WordCloud)) {
			return;
		}

		const effectId = getIntAndIncrement('WordCloudWrapper:dataEffect');

		const plot: WordCloud = plotRef.current;

		IS_DEVELOPMENT && console.log(`[WCWr][${id}] data effect ${effectId}: run`);

		plot.setData(document);

		return () => {
			IS_DEVELOPMENT && console.log(`[WCWr][${id}] data effect ${effectId}: cleanup`);
			plot.clearData();
		};

	}, [id, document]);

	useEffect(() => {

		if (!(plotRef.current instanceof WordCloud)) {
			return;
		}

		plotRef.current.setSelectedWords(selectedWords);

	}, [selectedWords]);

	useEffect(() => {

		if (!(plotRef.current instanceof WordCloud)) {
			return;
		}

		plotRef.current.setCommonWords(commonWords);

	}, [commonWords]);

	return (
		<div
			ref={handleWrapperElemRefChange}
			className="wordcloud-wrapper"
		>
			<div className="toolbar">
				<ResetZoomButton onClick={handleResetZoom} />
			</div>
		</div>
	);

});

export default WordCloudWrapper;
