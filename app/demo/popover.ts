import { select } from 'd3-selection';
import { Document } from './load-data';

const popover = select('body')
	.append('div')
	.attr('class', 'popover')
	.style('position', 'absolute')
	.style('display', 'none')
	.style('background', 'white')
	.style('padding', '5px')
	.style('border', '1px solid black')
	.style('border-radius', '5px');


function showPopover(event: PointerEvent, doc: Document) {
	// Extract the top 3 words and their counts
	const topWords = Array.from(doc.wordCounts.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3)
		.map(([word, count]) => `${word}: ${count}`)
		.join(', ');

	// Create the popover content
	const content = `
		ID: ${doc.id}<br>
		x: ${doc.position.x.toFixed(2)}, y: ${doc.position.y.toFixed(2)}<br>
		Top words: ${topWords}
  	`;

	popover
		.style('display', 'block')
		.style('left', event.pageX + 'px')
		.style('top', event.pageY + 'px')
		.html(content);
}

// Hide popover function
function hidePopover() {
	popover.style('display', 'none');
}

export { showPopover, hidePopover };
