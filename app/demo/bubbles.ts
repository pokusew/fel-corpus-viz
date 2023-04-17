"use strict";

// docs: https://github.com/d3/d3-selection
import { select, selectAll } from 'd3-selection';
// docs: https://github.com/d3/d3-zoom
import { zoom, zoomIdentity } from 'd3-zoom';
import { isDefined } from '../helpers/common';


const width = 800;
const height = 600;
const count = 100;


// create random data
interface Point {
	x: number;
	y: number;
	r: number;
	c: number;
}

const data: Point[] = [];
let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (let i = 0; i < count; i++) {
	const x = Math.random() * 600;
	const y = Math.random() * 400;
	const r = Math.random() * 50;
	const c = Math.floor(Math.random() * 3);
	data[i] = { x, y, r, c };
	minX = Math.min(minX, x - r);
	minY = Math.min(minY, y - r);
	maxX = Math.max(maxX, x + r);
	maxY = Math.max(maxY, y + r);
}
console.log(`[original-demo] data generated, data.length = ${data.length}`);

// create the svg element
const svg = select('#main-container').append('svg')
	.attr('width', width)
	.attr('height', height)
	.attr('viewBox', [0, 0, width, height])
	.style('border', '1px solid black')
	.on('click', handleClick);

// create the group to hold all circles
const g = svg.append('g');


// map data onto graphical elements
// see: https://github.com/d3/d3-selection#joining-data
//      https://bost.ocks.org/mike/join/
//      https://observablehq.com/@d3/selection-join
const color = ['yellow', 'green', 'blue'];
g.selectAll('circle')
	.data(data)
	.enter()
	.append('circle')
	.attr('id', (d, i) => `circle${i}`)
	.attr('cx', d => d.x)
	.attr('cy', d => d.y)
	.attr('r', d => d.r)
	.attr('fill', d => color[d.c])
	.attr('stroke', 'black');


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
const sceneWidth = maxX - minX;
const sceneHeight = maxY - minY;
const scale = Math.min(width / sceneWidth, height / sceneHeight);

// see https://github.com/d3/d3-zoom#zoom
const zoomExtent = zoom()
	.scaleExtent([0.1, 10])
	.on('zoom', zoomed);

svg.call(zoomExtent);

const resetZoom = () => svg.call(zoomExtent.transform, zoomIdentity.scale(scale).translate(-minX, -minY));

resetZoom();

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
