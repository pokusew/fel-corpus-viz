import { DatasetDocument } from '../demo/types';
import React, { MouseEventHandler, useCallback, useEffect, useRef } from 'react';
import { IS_DEVELOPMENT } from '../helpers/common';
import { getIntAndIncrement } from '../helpers/counter';
import { ResetZoomButton } from './common';
import { select, Selection } from 'd3-selection';
import { zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3-zoom';
import { calculateFontSizes, generateWordCloudPositions } from '../demo/wordcloud';


export class WordCloud {

	private readonly debugId: number;

	private svgElem: SVGSVGElement;
	private document: DatasetDocument;

	private svgSelection: Selection<SVGSVGElement, DatasetDocument, null, any>;
	private dataGroupWrapper: Selection<SVGGElement, DatasetDocument, null, any>;
	private dataGroup: Selection<SVGGElement, DatasetDocument, null, any>;
	private zoomBehavior: ZoomBehavior<SVGSVGElement, DatasetDocument>;

	private sizeInitialized: boolean = false;
	private width: number;
	private height: number;

	private xMargin: number = 30;
	private yMargin: number = 30;

	constructor(wrapperElem: HTMLElement, document: DatasetDocument, debugId?: number) {

		this.debugId = debugId ?? getIntAndIncrement('WordCloud');
		this.document = document;

		this.init(wrapperElem);
	}

	private init(wrapperElem: HTMLElement) {

		this.svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svgElem.classList.add('wordcloud');
		wrapperElem.append(this.svgElem);

		this.svgSelection = select(this.svgElem);

		this.dataGroupWrapper = this.svgSelection.append('g')
			.attr('class', 'data-wrapper');
		this.dataGroup = this.dataGroupWrapper.append('g')
			.attr('class', 'data-inner');

		this.zoomBehavior = zoom<SVGSVGElement, DatasetDocument>()
			// TODO: make sure scaleExtent is big enough before final deployment
			.scaleExtent([0.1, 10])
			// TODO: consider disabling double click zoom (may be clashing with fast selection)
			.on(`zoom`, ({ transform }) => this.handleZoom(transform));
		this.svgSelection.call(this.zoomBehavior);
		this.renderWordCloud(wrapperElem.clientWidth, wrapperElem.clientHeight);
	}

	private handleZoom(transform: ZoomTransform) {
		// IS_DEVELOPMENT && console.log(`[WordCloudD3][${this.debugId}] handleZoom`);
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

	private renderWordCloud(width: number, height: number) {
		if (width === this.width && height === this.height) {
			IS_DEVELOPMENT && console.log(
				`[WordCloudD3][${this.debugId}] skipping updateSize: width=${width}, height=${height}`,
			);
			return;
		} else {
			IS_DEVELOPMENT && console.log(`[WordCloudD3][${this.debugId}] updateSize: width=${width}, height=${height}`);
		}

		this.width = width;
		this.height = height;

		// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
		// min-x min-y width height
		this.svgSelection.attr('viewBox', [0, 0, width, height]);

		this.sizeInitialized = true;

		this.dataGroupWrapper
			.attr('transform', `translate(${this.xMargin},${this.yMargin})`);

		IS_DEVELOPMENT && console.log(`[WordCloudD3][${this.debugId}] mapDataToElements`);

		const wordCounts = this.document.wordCounts;
		const wordFontSizes = calculateFontSizes(wordCounts);
		const wordPositions = generateWordCloudPositions(wordFontSizes, this.width, this.height);

		wordPositions.forEach((pos, word) => {
			const fontSize = wordFontSizes.get(word)!;
			this.dataGroup
				.append('text')
				.attr('x', pos.x)
				// SVG text y position is at baseline, so we need to shift the text by its height
				.attr('y', pos.y + pos.height)
				.attr('font-size', `${fontSize}px`)
				.text(word);
		});
	}

	destroy() {
		IS_DEVELOPMENT && console.log(`[WordCloudD3][${this.debugId}] destroy`);
		// by removing the svg element we are (hopefully) removing its child elements
		// and all registered callbacks (both for the svg element and its child elements)
		// which should be free for later automatic GC (garbage collection)
		this.svgElem.remove();
	}
}


export interface WordCloudWrapperProps {
	document: DatasetDocument;
}

export const WordCloudWrapper = ({ document }: WordCloudWrapperProps) => {

	const wrapperElemRef = useRef<HTMLDivElement | null>(null);
	const plotRef = useRef<WordCloud | null>(null);

	const handleResetZoom = useCallback<MouseEventHandler<HTMLButtonElement>>((event) => {

		event.preventDefault();

		if (!(plotRef.current instanceof WordCloud)) {
			IS_DEVELOPMENT && console.error(`[ScWr] handleResetZoom missing plotRef.current`);
			return;
		}

		plotRef.current.resetZoom();

	}, []);

	useEffect(() => {

		if (!(wrapperElemRef.current instanceof HTMLDivElement)) {
			return;
		}

		const debugId = getIntAndIncrement('WordCloudWrapper:wrapperElemRef');

		IS_DEVELOPMENT && console.log(`[ScWr][${debugId}] wrapperElemRef effect run`);
		const wrapperElem: HTMLDivElement = wrapperElemRef.current;

		if (plotRef.current !== null) {
			IS_DEVELOPMENT && console.error(`[ScWr][${debugId}] wrapperElemRef plotRef.current !== null`);
		}

		const plot = new WordCloud(wrapperElem, document);

		plotRef.current = plot;

		return () => {
			IS_DEVELOPMENT && console.log(`[ScWr][${debugId}] wrapperElemRef effect cleanup`);
			plot.destroy();
			plotRef.current = null;
		};

	}, [document]);

	return (
		<div
			ref={wrapperElemRef}
			className="scatterplot-wrapper"
			// onClick={() => setCount(prevCount => prevCount + 1)}
		>
			<div className="toolbar">
				<ResetZoomButton onClick={handleResetZoom} />
			</div>
		</div>
	);

};
