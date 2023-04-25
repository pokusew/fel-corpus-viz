"use strict";

// docs: https://github.com/d3/d3-selection
import { select } from 'd3-selection';
// docs: https://github.com/d3/d3-zoom
import { zoom, zoomIdentity } from 'd3-zoom';
import { isDefined } from '../helpers/common';
import { loadDataFromFile } from './load-data';
import txtFilePath from '../data/doc_embeddings.kos.txt';


const width = 800;
const height = 600;


interface Point {
	x: number;
	y: number;
	r: number;
	c: number;
}


// create the svg element and a group to hold all the circles

const svg = select('#main-container').append('svg');
const g = svg.append('g');


let minX = 0;
let minY = 0;
let maxX = 0;
let maxY = 0;
const r = 0.3;


function renderData(data: Point[]) {

	minX = Math.min(...data.map(d => d.x));
	minY = Math.min(...data.map(d => d.y));
	maxX = Math.max(...data.map(d => d.x));
	maxY = Math.max(...data.map(d => d.y));

	// map data onto graphical elements
	// see: https://github.com/d3/d3-selection#joining-data
	//      https://bost.ocks.org/mike/join/
	//      https://observablehq.com/@d3/selection-join

	svg
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [minX - r, minY - r, maxX - minX + 2 * r, maxY - minY + 2 * r])
		.style('border', '1px solid black')
		.on('click', handleClick);

	const color = ['yellow', 'green', 'blue'];
	const circles = g.selectAll('circle').data(data);
	// enter selection
	circles.enter().append('circle')
		.attr('id', (d, i) => `circle${i}`)
		.attr('cx', d => d.x)
		.attr('cy', d => d.y)
		.attr('r', d => d.r)
		.attr('fill', d => color[d.c])
		.attr('stroke', 'black')
		.attr('stroke-width', d => d.r)
		.attr('cursor', 'pointer');
}

loadDataFromFile(txtFilePath)
	.then((data) => {
		console.log(`[original-demo] data loaded, data.length = ${data.length}`);

		renderData(data.map(d => ({
			x: d.x,
			y: d.y,
			r: r,
			c: 0,
		})));

		resetZoom();

	})
	.catch((error) => {
		console.error('Error reading file:', error);
	});


// selection

let selected: SVGCircleElement | null = null;

// this function is added as a handler for the 'click' event on the svg element
// thanks to the event propagation rules, every click to any nested element will also trigger this callback
function handleClick(event: PointerEvent, d: Point) {

	// this === event.currentTarget
	// event.currentTarget - the current element (bubbling up from event.target up the svg container with the listener)
	// event.target - the element where the event occurred
	// d (datum) === this.__data__ === event.currentTarget.__data__
	// console.log(
	// 	`[original-demo] handle click`,
	// 	'\n  this =', this,
	// 	'\n  event.currentTarget =', event.currentTarget,
	// 	'\n  d =', d,
	// 	'\n  event.target =', event.target,
	// );

	// always deselect the previously selected element
	if (isDefined(selected)) {
		selected.setAttribute('stroke', 'black');
		selected = null;
	}

	// if the user clicked on some circle
	if (event.target instanceof SVGCircleElement) {
		// do not bubble up to the svg
		event.stopPropagation();
		// select this circle
		selected = event.target;
		selected.setAttribute('stroke', 'red');
		// select(selected).attr('stroke', 'red');
		return;
	}

	// otherwise, the user clicked somewhere else (within the svg container)
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
if (import.meta.webpackHot) {
	import.meta.webpackHot.dispose((data) => {
		console.log(`[original-demo][HMR] cleanup`);
		document.querySelector('#main-container svg')?.remove();
		resetZoomBtn.removeEventListener('click', handleResetZoomBtnClick);
	});
	import.meta.webpackHot.accept();
}
