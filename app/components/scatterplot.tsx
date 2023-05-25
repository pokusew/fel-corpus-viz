"use strict";

import React, { useEffect, useRef, useCallback, useState, MouseEventHandler } from 'react';
import { IS_DEVELOPMENT, isDefined } from '../helpers/common';
import { getIntAndIncrement } from '../helpers/counter';

// docs: https://github.com/d3/d3-selection
import { BaseType, select, Selection } from 'd3-selection';
// docs: https://github.com/d3/d3-zoom
import { zoom, ZoomBehavior, zoomIdentity, ZoomTransform, zoomTransform } from 'd3-zoom';
// docs: https://github.com/d3/d3-scale
import { ScaleLinear, scaleLinear } from 'd3-scale';
// docs: https://github.com/d3/d3-axis
import { Axis, axisBottom, axisLeft } from 'd3-axis';
// docs: https://github.com/d3/d3-transition
// import {} from 'd3-transition';

import IconMinimizeLight from '-!svg-react-loader?name=IconMinimizeLight!../images/icons/minimize-light.svg';
import { DatasetDocument } from '../demo/types';
import { ResetZoomButton } from './common';


export class Scatterplot {

	private readonly debugId: number;

	private svgElem: SVGSVGElement;
	private data: DatasetDocument[];

	private resizeObserver: ResizeObserver;

	private svgSelection: Selection<SVGSVGElement, DatasetDocument, null, any>;
	private dataGroupWrapper: Selection<SVGGElement, DatasetDocument, null, any>;
	private dataGroup: Selection<SVGGElement, DatasetDocument, null, any>;
	private xAxisGroup: Selection<SVGGElement, DatasetDocument, null, any>;
	private yAxisGroup: Selection<SVGGElement, DatasetDocument, null, any>;
	private zoomBehavior: ZoomBehavior<SVGSVGElement, DatasetDocument>;

	private xScale: ScaleLinear<number, number>;
	private yScale: ScaleLinear<number, number>;
	private xScaleWithZoomTransform: ScaleLinear<number, number>;
	private yScaleWithZoomTransform: ScaleLinear<number, number>;
	private xAxis: Axis<number | { valueOf(): number }>;
	private yAxis: Axis<number | { valueOf(): number }>;

	private minX: number;
	private minY: number;
	private maxX: number;
	private maxY: number;

	private sizeInitialized: boolean = false;
	private width: number;
	private height: number;

	private xMargin: number = 30;
	private yMargin: number = 30;

	private selectedPoints = new Set<number>();

	constructor(wrapperElem: HTMLElement, data: DatasetDocument[], debugId?: number) {

		this.debugId = debugId ?? getIntAndIncrement('Scatterplot');
		this.data = data;

		this.init(wrapperElem);
	}

	private init(wrapperElem: HTMLElement) {

		this.svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svgElem.classList.add('scatterplot');
		wrapperElem.append(this.svgElem);

		this.svgSelection = select(this.svgElem);

		const self = this;

		this.svgSelection.on('click', function (event, d) {
			// note: we actually do not need this, as this === event.currentTarget
			self.handleClick(this, event, d);
		});

		this.xScale = scaleLinear();
		this.yScale = scaleLinear();

		this.xAxis = axisBottom(this.xScale);
		this.yAxis = axisLeft(this.yScale);

		this.dataGroupWrapper = this.svgSelection.append('g')
			.attr('class', 'data-wrapper');
		this.dataGroup = this.dataGroupWrapper.append('g')
			.attr('class', 'data-inner');
		this.xAxisGroup = this.svgSelection.append('g')
			.attr('class', 'axis axis-x');
		this.yAxisGroup = this.svgSelection.append('g')
			.attr('class', 'axis axis-y');

		this.zoomBehavior = zoom<SVGSVGElement, DatasetDocument>()
			// TODO: make sure scaleExtent is big enough before final deployment
			.scaleExtent([0.1, 10])
			// TODO: consider disabling double click zoom (may be clashing with fast selection)
			.on(`zoom`, ({ transform }) => this.handleZoom(transform));
		this.svgSelection.call(this.zoomBehavior);

		this.resizeObserver = new ResizeObserver(entries => {
			if (entries.length < 1 || entries[0].target !== wrapperElem) {
				IS_DEVELOPMENT && console.error(
					`[ScatterplotD3][${this.debugId}] unexpected resizeObserver callback invocation`, entries,
				);
				return;
			}
			const entry = entries[0];
			// contentBoxSize is a newer API, the contentRect might eventually be deprecated
			const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
			const height = entry.contentBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
			this.updateSize(width, height);
		});

		this.computeDataBounds();

		// Note:
		//   Observing svg elements seems to be not working in WebKit (Chrome works great)
		//   This might be related to the special treatment svg has in the Resize Observer spec.
		//   Here is a SO question that addresses it:
		//     https://stackoverflow.com/questions/65565149/how-to-apply-resizeobserver-to-svg-element
		//   Here is a possibly related GH issue with more context about the spec:
		//     https://github.com/w3c/csswg-drafts/issues/4032
		// So to overcome the current issue in WebKit, instead of observe the svgElem like this:
		//   this.resizeObserver.observe(this.svgElem);
		// we observe the wrapperElem which has the exact same size in our layout.
		this.resizeObserver.observe(wrapperElem);

		// we can actually omit (currently omitted) the following getBoundingClientRect() + updateSize() call
		// as the resizeObserver callback is always invoked
		// with the current (initial) size when we start observing svgElem
		// using resizeObserver.observe() (callback invocation: initial state + then all changes)

		// const boundingClientRect = this.svgElem.getBoundingClientRect();
		// this.updateSize(boundingClientRect.width, boundingClientRect.height);

	}

	private computeDataBounds() {
		this.minX = Infinity;
		this.minY = Infinity;
		this.maxX = -Infinity;
		this.maxY = -Infinity;
		for (const d of this.data) {

			if (d.position.x < this.minX) {
				this.minX = d.position.x;
			}
			if (d.position.x > this.maxX) {
				this.maxX = d.position.x;
			}

			if (d.position.y < this.minY) {
				this.minY = d.position.y;
			}
			if (d.position.y > this.maxY) {
				this.maxY = d.position.y;
			}

		}
		this.xScale.domain([this.minX, this.maxX]);
		this.yScale.domain([this.minY, this.maxY]);
	}

	private updateScalesWithZoomTransform(transform?: ZoomTransform): boolean {

		if (!this.sizeInitialized) {
			IS_DEVELOPMENT && console.error(
				`[ScatterplotD3][${this.debugId}] updateScalesWithZoomTransform when size not initialized`,
			);
			return false;
		}

		transform = transform ?? zoomTransform(this.svgElem);

		// TODO: remove noinspection once type definitions are fixed (LinearScale should be subtype of ZoomScale)
		// noinspection TypeScriptValidateTypes
		this.xScaleWithZoomTransform = transform.rescaleX(this.xScale);
		// noinspection TypeScriptValidateTypes
		this.yScaleWithZoomTransform = transform.rescaleY(this.yScale);

		// need to rebind as the transform.rescaleX/Y always returns a new instance
		// (and does not modify the original scales)
		// (it actually makes sense as we want to preserve the original scales for data mapping)
		this.xAxis.scale(this.xScaleWithZoomTransform);
		this.yAxis.scale(this.yScaleWithZoomTransform);

		return true;

	}

	private handleZoom(transform: ZoomTransform) {

		// IS_DEVELOPMENT && console.log(`[ScatterplotD3][${this.debugId}] handleZoom`);

		if (this.updateScalesWithZoomTransform(transform)) {
			this.xAxisGroup.call(this.xAxis.scale(this.xScaleWithZoomTransform));
			this.yAxisGroup.call(this.yAxis.scale(this.yScaleWithZoomTransform));
		}

		this.dataGroup.attr('transform', transform.toString());

	}

	public resetZoom() {
		// without animation:
		// this.svgSelection.call(this.zoomBehavior.transform, zoomIdentity);

		// with animation:
		// TODO: remove noinspection once type definitions are fixed
		// noinspection TypeScriptValidateTypes
		this.svgSelection.transition()
			.duration(750)
			.call(this.zoomBehavior.transform, zoomIdentity);
	}

	private updateSize(width: number, height: number) {

		if (width === this.width && height === this.height) {
			IS_DEVELOPMENT && console.log(
				`[ScatterplotD3][${this.debugId}] skipping updateSize: width=${width}, height=${height}`,
			);
			return;
		} else {
			IS_DEVELOPMENT && console.log(`[ScatterplotD3][${this.debugId}] updateSize: width=${width}, height=${height}`);
		}

		this.width = width;
		this.height = height;

		// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
		// min-x min-y width height
		this.svgSelection.attr('viewBox', [0, 0, width, height]);

		this.xScale.range([0, this.width - 2 * this.xMargin]);
		this.yScale.range([this.height - 2 * this.yMargin, 0]);

		this.sizeInitialized = true;

		this.updateScalesWithZoomTransform();

		this.dataGroupWrapper
			.attr('transform', `translate(${this.xMargin},${this.yMargin})`);

		this.xAxisGroup
			.attr('transform', `translate(${this.xMargin},${this.height - this.yMargin})`)
			.call(this.xAxis);
		this.yAxisGroup
			.attr('transform', `translate(${this.xMargin},${this.yMargin})`)
			.call(this.yAxis);

		this.mapDataToElements();

	}

	private mapDataToElements() {

		IS_DEVELOPMENT && console.log(`[ScatterplotD3][${this.debugId}] mapDataToElements`);

		const pointRadius = 2;
		const pointStrokeWidth = 0.1;

		const points = this.dataGroup.selectAll('circle')
			.data(this.data);

		// TODO: Instead of mapping data points to circles, map them to paths and use only stroke
		//       to make them look like circles. Then, we can change stroke-width per-whole dataGroup
		//       and achieve performant fixed-size shapes while zooming.
		//       see https://observablehq.com/@d3/zoomable-scatterplot

		points.join(
			enter => enter
				.append('circle')
				.attr('class', 'point')
				.attr('id', d => `point-${d.id}`)
				.attr('r', pointRadius),
			update => update,
			exit => exit.remove(),
		)
			// the following will be performed for both enter and update
			.attr('cx', d => this.xScale(d.position.x))
			.attr('cy', d => this.yScale(d.position.y));

	}

	private handleClick(callbackThis: BaseType, event: PointerEvent, callbackD: DatasetDocument | undefined) {

		// this function is added as a handler for the 'click' event on the svg element
		// thanks to the event propagation rules, every click to any nested element will also trigger this callback

		// callbackThis === event.currentTarget

		// event.currentTarget
		// - The current target for the event, as the event traverses the DOM (bubbles up from event.target).
		//   It always refers to the element to which the event handler has been attached.
		// event.target
		// - the element on which the event occurred and which may be the event.currentTarget's descendant

		// callbackD (datum) === callbackThis.__data__ === event.currentTarget.__data__
		// == undefined (because there is no datum mapped on the svg container itself)
		// IS_DEVELOPMENT && console.log(
		// 	`[ScatterplotD3][${this.debugId}] handleClick`,
		// 	'\n  callbackThis =', callbackThis,
		// 	'\n  event.currentTarget =', event.currentTarget,
		// 	'\n  callbackD =', callbackD,
		// 	'\n  event.target =', event.target,
		// );

		// if the user clicked on some data point
		if (
			event.target instanceof SVGCircleElement
			&& event.target.classList.contains('point')
			&& isDefined(event.target['__data__'])
		) {
			// const d = select(event.target).datum() as DatasetDocument;
			const d = event.target['__data__'] as DatasetDocument;
			if (this.selectedPoints.has(d.id)) {
				// deselect the point
				event.target.classList.remove('selected');
				this.selectedPoints.delete(d.id);
			} else {
				// select the point
				event.target.classList.add('selected');
				this.selectedPoints.add(d.id);
			}
			this.onSelectedPointsChange();
			// stop processing the event
			return;
		}

		// otherwise, the user clicked somewhere else (within the svg container)
		// -> deselect the previously selected point(s)
		if (this.selectedPoints.size > 0) {
			this.dataGroup.selectAll('.selected')
				.classed('selected', false);
			this.selectedPoints.clear();
			this.onSelectedPointsChange();
		}

	}

	private onSelectedPointsChange() {
		IS_DEVELOPMENT && console.log(`[ScatterplotD3][${this.debugId}] onSelectedPointsChange`, this.selectedPoints);
		// TODO: emit event / invoke callback
	}

	destroy() {
		IS_DEVELOPMENT && console.log(`[ScatterplotD3][${this.debugId}] destroy`);
		// unregister the resizeObserver otherwise the callback will be invoked
		// when the svg element is removed from the DOM nad its size changes to 0
		this.resizeObserver.disconnect();
		// by removing the svg element we are (hopefully) removing its child elements
		// and all registered callbacks (both for the svg element and its child elements)
		// which should be free for later automatic GC (garbage collection)
		this.svgElem.remove();
	}

}

export interface ScatterplotWrapperProps {
	data: DatasetDocument[];
}

export const ScatterplotWrapper = ({ data }: ScatterplotWrapperProps) => {

	const wrapperElemRef = useRef<HTMLDivElement | null>(null);
	const plotRef = useRef<Scatterplot | null>(null);

	// const [count, setCount] = useState<number>(0);

	const handleResetZoom = useCallback<MouseEventHandler<HTMLButtonElement>>((event) => {

		event.preventDefault();

		if (!(plotRef.current instanceof Scatterplot)) {
			IS_DEVELOPMENT && console.error(`[ScWr] handleResetZoom missing plotRef.current`);
			return;
		}

		plotRef.current.resetZoom();

	}, []);

	useEffect(() => {

		if (!(wrapperElemRef.current instanceof HTMLDivElement)) {
			return;
		}

		const debugId = getIntAndIncrement('ScatterplotWrapper:wrapperElemRef');

		IS_DEVELOPMENT && console.log(`[ScWr][${debugId}] wrapperElemRef effect run`);
		const wrapperElem: HTMLDivElement = wrapperElemRef.current;

		if (plotRef.current !== null) {
			IS_DEVELOPMENT && console.error(`[ScWr][${debugId}] wrapperElemRef plotRef.current !== null`);
		}

		const plot = new Scatterplot(wrapperElem, data);

		plotRef.current = plot;

		return () => {
			IS_DEVELOPMENT && console.log(`[ScWr][${debugId}] wrapperElemRef effect cleanup`);
			plot.destroy();
			plotRef.current = null;
		};

	}, [data]);

	return (
		<div
			ref={wrapperElemRef}
			className="scatterplot-wrapper"
			// onClick={() => setCount(prevCount => prevCount + 1)}
		>
			<div className="toolbar">
				<ResetZoomButton onClick={handleResetZoom}/>
			</div>
		</div>
	);

};
