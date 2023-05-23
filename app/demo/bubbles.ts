"use strict";

// docs: https://github.com/d3/d3-selection
import { select } from 'd3-selection';
// docs: https://github.com/d3/d3-zoom
import { zoom, zoomIdentity } from 'd3-zoom';
import { isDefined } from '../helpers/common';
import { hidePopover, showPopover } from './popover';
import { loadDataset } from './load-dataset';
import { calculateFontSizes, estimateTextSize, generateWordPositions } from './wordcloud';
import { DatasetDescriptor, DatasetDocument } from './types';


const width = 800;
const height = 600;


// Create a new SVG element for the word cloud
const svgWordCloud = select('#main-container').append('svg');
const gWordCloud = svgWordCloud.append('g');


// create the svg element and a group to hold all the circles

const svg = select('#main-container').append('svg')
	.attr('id', 'demo-scatterplot');
const g = svg.append('g');


let minX = 0;
let minY = 0;
let maxX = 0;
let maxY = 0;
const docPointColor = 'yellow';
const docPointRadius = 0.1;
const docStrokeWidth = 0.1;


function renderWordCloud(document: DatasetDocument) {
	svgWordCloud
		.attr('width', width)
		.attr('height', height)
		.style('border', '1px solid black');

	const wordCounts = document.wordCounts;
	const wordSizes = calculateFontSizes(wordCounts);
	const wordPositions = generateWordPositions(wordSizes, width, height);

	wordSizes.forEach((fontSize, word) => {
		const { x, y } = wordPositions.get(word)!;
		const estimatedSize = estimateTextSize(word, fontSize);

		gWordCloud
			.append('text')
			.attr('x', x)
			// SVG text y position is at baseline, so we need to shift the text by its height
			.attr('y', y + estimatedSize.height)
			.attr('font-size', `${fontSize}px`)
			.text(word);

		// add a rectangle around the word for debugging
		// const estimatedSize = estimateSize(word, fontSize);
		// gWordCloud.append('rect')
		//     .attr('x', x)
		//     .attr('y', y)  // SVG text y position is at baseline
		//     .attr('width', estimatedSize.width)
		//     .attr('height', estimatedSize.height)
		//     .attr('fill', 'none')
		//     .attr('stroke', 'red');

	});

}

function renderData(data: DatasetDocument[]) {

	minX = Math.min(...data.map(d => d.position.x));
	minY = Math.min(...data.map(d => d.position.y));
	maxX = Math.max(...data.map(d => d.position.x));
	maxY = Math.max(...data.map(d => d.position.y));

	// map data onto graphical elements
	// see: https://github.com/d3/d3-selection#joining-data
	//      https://bost.ocks.org/mike/join/
	//      https://observablehq.com/@d3/selection-join

	// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
	// min-x min-y width height
	const viewBox = [
		// min-x
		minX - docPointRadius - docStrokeWidth / 2,
		// min-y
		minY - docPointRadius - docStrokeWidth / 2,
		// width
		maxX - minX + 2 * docPointRadius + docStrokeWidth,
		// height
		maxY - minY + 2 * docPointRadius + docStrokeWidth,
	];
	svg
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', viewBox)
		.style('border', '1px solid black')
		.on('click', handleClickSvgContainer);

	const circles = g.selectAll('circle').data(data);
	// enter selection
	circles
		.enter()
		.append('circle')
		.attr('id', (d, i) => `circle${i}`)
		.attr('cx', d => d.position.x)
		.attr('cy', d => d.position.y)
		.attr('r', docPointRadius)
		.attr('fill', docPointColor)
		.attr('stroke', 'black')
		.attr('stroke-width', docStrokeWidth)
		.attr('cursor', 'pointer')
		.on('mouseover', showPopover)
		// hide the popover when the mouse leaves the circle unless it was clicked on
		.on('mouseout', (event, point) => selected !== event.target ? hidePopover() : null)
		.on('click', handleClickDataPoint);
}


const datasetDescriptor: DatasetDescriptor = {
	corpusName: 'kos',
	preprocessingMethod: 'bow',
	embeddingMethod: 'pca',
};

loadDataset(datasetDescriptor)
	.then((dataset) => {
		console.log(`[original-demo] data loaded, datasetSize = ${dataset.documents.length}`);
		renderData(dataset.documents);
		renderWordCloud(dataset.documents[5]);
		resetZoom();
	})
	.catch((error) => {
		console.error('Error reading file:', error);
	});


// selection

let selected: SVGCircleElement | null = null;


// this function is added as a handler for the 'click' event on the svg element
// thanks to the event propagation rules, every click to any nested element will also trigger this callback
// unless the event is stopped from propagating further
function handleClickSvgContainer(event: PointerEvent, point: DatasetDocument) {

	// always deselect the previously selected element
	if (isDefined(selected)) {
		selected.setAttribute('stroke', 'black');
		selected = null;
	}
	// hide popover when clicking somewhere within the svg container
	hidePopover();
}

function handleClickDataPoint(event: PointerEvent, point: DatasetDocument) {
	// do not bubble up to the svg
	event.stopPropagation();
	// select this circle
	selected = event.target as SVGCircleElement;
	selected.setAttribute('stroke', 'red');
	// show popover
	showPopover(event, point);
}

// zoom and pan

// calculate and set the initial transformation matrix
// see https://github.com/d3/d3-zoom#zoom
const zoomExtent = zoom()
	.scaleExtent([0.1, 10])
	.on('zoom', zoomed);

svg.call(zoomExtent);

const resetZoom = () => {
	const initialTransform = zoomIdentity.translate(0, 0).scale(1);
	svg.call(zoomExtent.transform, initialTransform);
};


const resetZoomBtn = document.getElementById('reset-zoom-btn') as HTMLButtonElement;

const handleResetZoomBtnClick = (event: MouseEvent) => {
	event.preventDefault();
	resetZoom();
};

resetZoomBtn.addEventListener('click', handleResetZoomBtnClick);

function zoomed({ transform }) {
	// console.log('[original-demo] zoomed');
	g.attr('transform', transform);
}


// --- webpack Hot Module Replacement API
// @ts-ignore
if (import.meta.webpackHot) {
	// @ts-ignore
	import.meta.webpackHot.dispose((data) => {
		console.log(`[original-demo][HMR] cleanup`);
		document.querySelector('#main-container #demo-scatterplot')?.remove();
		resetZoomBtn.removeEventListener('click', handleResetZoomBtnClick);
	});
	// @ts-ignore
	import.meta.webpackHot.accept();
}
