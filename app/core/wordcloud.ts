import { IS_DEVELOPMENT, isDefined } from '../helpers/common';
import { getIntAndIncrement } from '../helpers/counter';

// docs: https://github.com/d3/d3-selection
import { BaseType, select, Selection } from 'd3-selection';
// docs: https://github.com/d3/d3-zoom
import { zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3-zoom';

import { DatasetDocument } from './types';
import { calculateFontSizes, generateWordCloudPositions, PositionSize } from './wordle';
import { SelectedWords } from './scatterplot';


export interface Word {
	word: string;
	pos: PositionSize;
	fontSize: number;
}

export class WordCloud {

	private readonly debugId: number;

	private svgElem: SVGSVGElement;
	private data: Word[] = [];
	private document: DatasetDocument | undefined;

	private svgSelection: Selection<SVGSVGElement, DatasetDocument, null, any>;
	private dataGroupWrapper: Selection<SVGGElement, DatasetDocument, null, any>;
	private dataGroup: Selection<SVGGElement, DatasetDocument, null, any>;
	private zoomBehavior: ZoomBehavior<SVGSVGElement, DatasetDocument>;

	private sizeInitialized: boolean = false;
	private width: number;
	private height: number;

	private xMargin: number = 32;
	private yMargin: number = 32;

	private selectedWordsChangeHandler: ((points: SelectedWords) => void) | undefined;
	private selectedWords: Set<string> = new Set<string>();
	private selectedWordsImmutable: SelectedWords = new Set<string>();

	private commonWordsImmutable: SelectedWords = new Set<string>();

	constructor(wrapperElem: HTMLElement, debugId?: number) {

		this.debugId = debugId ?? getIntAndIncrement('WordCloud');
		this.document = undefined;

		this.init(wrapperElem);
	}

	public setSelectedWordsChangeHandler(handler: (points: SelectedWords) => void | undefined) {
		this.selectedWordsChangeHandler = handler;
	}

	public setSelectedWords(points: SelectedWords) {

		if (this.selectedWordsImmutable === points) {
			return;
		}

		this.selectedWords.clear();
		for (const id of points) {
			this.selectedWords.add(id);
		}

		this.selectedWordsImmutable = points;

		this.mapSelectedWordsToElements();

	}

	public setCommonWords(points: SelectedWords) {

		if (this.commonWordsImmutable === points) {
			return;
		}

		this.commonWordsImmutable = points;

		this.mapCommonWordsToElements();

	}

	private mapSelectedWordsToElements() {

		IS_DEVELOPMENT && console.log(
			`[WordCloudD3][${this.debugId}] mapSelectedWordsToElements`, this.selectedWords,
		);

		// TODO: maybe there is a more effective way
		this.dataGroup.selectAll('.word')
			.data(this.data)
			.classed('selected', (d) => this.selectedWords.has(d.word));
	}

	private mapCommonWordsToElements() {

		IS_DEVELOPMENT && console.log(
			`[WordCloudD3][${this.debugId}] mapCommonWordsToElements`, this.commonWordsImmutable,
		);

		// TODO: maybe there is a more effective way
		this.dataGroup.selectAll('.word')
			.data(this.data)
			.classed('common', (d) => this.commonWordsImmutable.has(d.word));
	}

	public setData(doc: DatasetDocument | undefined) {
		this.document = doc;
		if (this.sizeInitialized) {
			this.mapData();
		}

	}

	public clearData() {
		this.setData(undefined);
	}

	private init(wrapperElem: HTMLElement) {

		this.svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svgElem.classList.add('wordcloud');
		wrapperElem.append(this.svgElem);

		this.svgSelection = select(this.svgElem);

		const self = this;

		this.svgSelection.on('click', function (event, d) {
			// note: we actually do not need this, as this === event.currentTarget
			self.handleClick(this, event, d);
		});

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

	public resetZoom(withAnimation: boolean = true) {
		if (withAnimation) {
			// with animation:
			// TODO: remove noinspection once type definitions are fixed
			// noinspection TypeScriptValidateTypes
			this.svgSelection.transition()
				.duration(750)
				.call(this.zoomBehavior.transform, zoomIdentity);
		} else {
			this.svgSelection.call(this.zoomBehavior.transform, zoomIdentity);
		}
	}

	private mapData() {
		IS_DEVELOPMENT && console.log(`[WordCloudD3][${this.debugId}] mapDataToElements`);

		if (this.document === undefined) {
			return null;
		}

		const wordCounts = this.document.wordCounts;
		const wordFontSizes = calculateFontSizes(wordCounts);
		const wordPositions = generateWordCloudPositions(
			wordFontSizes,
			this.width - 2 * this.xMargin,
			this.height - 2 * this.yMargin,
		);

		this.data = [...wordPositions.entries()].map(([word, pos]) => ({
			word,
			pos,
			fontSize: wordFontSizes.get(word)!,
		}));

		this.dataGroup.selectAll('text')
			.data(this.data)
			.enter()
			.append('text')
			.attr('class', 'word')
			.attr('x', d => d.pos.x)
			// SVG text y position is at baseline, so we need to shift the text by its height
			.attr('y', d => d.pos.y + d.pos.height)
			.attr('font-size', d => `${d.fontSize}px`)
			.text(d => d.word);
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

	}

	private handleClick(callbackThis: BaseType, event: PointerEvent, callbackD: DatasetDocument | undefined) {

		// if the user clicked on some data point
		if (
			event.target instanceof SVGTextElement
			&& isDefined(event.target['__data__'])
		) {
			// const d = select(event.target).datum() as DatasetDocument;
			const d = event.target['__data__'] as Word;
			if (this.selectedWords.has(d.word)) {
				// deselect the point
				event.target.classList.remove('selected');
				this.selectedWords.delete(d.word);
			} else {
				// select the point
				event.target.classList.add('selected');
				this.selectedWords.add(d.word);
			}
			this.onSelectedWordsChange();
			// stop processing the event
			return;
		}

		// otherwise, the user clicked somewhere else (within the svg container)
		// -> deselect the previously selected point(s)
		if (this.selectedWords.size > 0) {
			this.dataGroup.selectAll('.selected')
				.classed('selected', false);
			this.selectedWords.clear();
			this.onSelectedWordsChange();
		}

	}

	private onSelectedWordsChange() {
		IS_DEVELOPMENT && console.log(`[WordCloudD3][${this.debugId}] onSelectedWordsChange`, this.selectedWords);
		this.selectedWordsImmutable = new Set(this.selectedWords);
		if (this.selectedWordsChangeHandler !== undefined) {
			this.selectedWordsChangeHandler(this.selectedWordsImmutable);
		}
	}

	destroy() {
		IS_DEVELOPMENT && console.log(`[WordCloudD3][${this.debugId}] destroy`);
		// by removing the svg element we are (hopefully) removing its child elements
		// and all registered callbacks (both for the svg element and its child elements)
		// which should be free for later automatic GC (garbage collection)
		this.svgElem.remove();
	}
}
