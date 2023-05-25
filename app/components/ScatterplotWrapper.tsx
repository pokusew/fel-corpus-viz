import React, {
	useId,
	useRef,
	RefCallback,
	useEffect,
	useCallback,
	MouseEventHandler,
	forwardRef,
	useImperativeHandle,
	useState,
} from 'react';

import { IS_DEVELOPMENT } from '../helpers/common';
import { getIntAndIncrement } from '../helpers/counter';
import { DatasetDocument } from '../core/types';
import { ResetZoomButton } from './common';
import { Scatterplot, SelectedPoints, SelectedWords } from '../core/scatterplot';


export interface ScatterplotWrapperProps {
	data: DatasetDocument[] | undefined;
	onSelectedPointsChange: (points: SelectedPoints) => void;
	selectedPoints: SelectedPoints;
	selectedWords: SelectedWords;
}

export const ScatterplotWrapper = forwardRef((
	{
		data,
		onSelectedPointsChange,
		selectedPoints,
		selectedWords,
	}: ScatterplotWrapperProps,
	ref,
) => {

	const id = useId();
	const plotRef = useRef<Scatterplot | null>(null);

	const [fixedRatio, setFixedRatio] = useState<boolean>(false);

	useImperativeHandle(ref, () => {
		const initId = getIntAndIncrement('ScatterplotWrapper:useImperativeHandle');
		IS_DEVELOPMENT && console.log(
			`[ScWr][${id}] useImperativeHandle ${initId} callback invocation`,
			plotRef.current != null,
		);
		return plotRef.current;
	}, [id]);

	// see https://react.dev/reference/react-dom/components/common#ref-callback
	// see https://julesblom.com/writing/ref-callback-use-cases
	const handleWrapperElemRefChange: RefCallback<HTMLDivElement> = useCallback((elem) => {

		IS_DEVELOPMENT && console.log(
			`[ScWr][${id}] handleWrapperElemRefChange ref callback invocation`,
			// elem, plotRef.current,
		);

		if (elem instanceof HTMLDivElement) {
			if (plotRef.current !== null) {
				IS_DEVELOPMENT && console.error(
					`[ScWr][${id}] handleWrapperElemRefChange unexpected state:`,
					`elem instanceof HTMLDivElement && plotRef.current !== null`,
					elem, plotRef.current,
				);
				return;
			}
			plotRef.current = new Scatterplot(elem);
			return;
		}

		const plot = plotRef.current;
		if (plot === null) {
			IS_DEVELOPMENT && console.error(
				`[ScWr][${id}] handleWrapperElemRefChange unexpected state:`,
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

		if (!(plotRef.current instanceof Scatterplot)) {
			IS_DEVELOPMENT && console.error(`[ScWr] handleResetZoom missing plotRef.current`);
			return;
		}

		plotRef.current.resetZoom();

	}, []);

	const handleSetFixedRatio = useCallback<MouseEventHandler<HTMLButtonElement>>((event) => {

		event.preventDefault();

		setFixedRatio(prev => !prev);

	}, [setFixedRatio]);

	useEffect(() => {

		if (!(plotRef.current instanceof Scatterplot)) {
			return;
		}

		plotRef.current.setSelectedPointsChangeHandler(onSelectedPointsChange);

	}, [onSelectedPointsChange]);

	useEffect(() => {

		if (!(plotRef.current instanceof Scatterplot)) {
			return;
		}

		plotRef.current.setFixedRatio(fixedRatio);

	}, [fixedRatio]);

	useEffect(() => {

		if (!(plotRef.current instanceof Scatterplot)) {
			return;
		}

		const effectId = getIntAndIncrement('ScatterplotWrapper:dataEffect');

		const plot: Scatterplot = plotRef.current;

		IS_DEVELOPMENT && console.log(`[ScWr][${id}] data effect ${effectId}: run with data?.length =`, data?.length);

		if (data !== undefined) {
			plot.setData(data);
		}

		return () => {
			IS_DEVELOPMENT && console.log(`[ScWr][${id}] data effect ${effectId}: cleanup`);
			plot.clearData();
		};

	}, [id, data]);

	useEffect(() => {

		if (!(plotRef.current instanceof Scatterplot)) {
			return;
		}

		plotRef.current.setSelectedPoints(selectedPoints);

	}, [selectedPoints]);

	useEffect(() => {

		if (!(plotRef.current instanceof Scatterplot)) {
			return;
		}

		plotRef.current.setSelectedWords(selectedWords);

	}, [selectedWords]);

	return (
		<div
			ref={handleWrapperElemRefChange}
			className="scatterplot-wrapper"
		>
			<div className="toolbar">
				<button type="button" name="toggleRatio" className="btn btn-sm" onClick={handleSetFixedRatio}>
					<span>XY: {fixedRatio ? '1:1' : 'auto'}</span>
				</button>
				<ResetZoomButton onClick={handleResetZoom} />
			</div>
		</div>
	);

});

export default ScatterplotWrapper;
