import { DatasetDocument } from './types';


export interface PopoverController {
	showPopover: (event: PointerEvent, doc: DatasetDocument) => void;
	hidePopover: () => void;
	destroy: () => void;
}

export function createPopover(container: HTMLElement): PopoverController {

	let popover: HTMLDivElement | null = document.createElement('div');
	popover.classList.add('popover');

	const line1 = new Text();
	const line2 = new Text();
	const line3 = new Text();
	popover.append(
		line1,
		document.createElement('br'),
		line2,
		document.createElement('br'),
		line3,
	);

	container.append(popover);

	function showPopover(event: PointerEvent, doc: DatasetDocument) {

		if (popover === null) {
			return;
		}

		// extract the top 3 words and their counts
		const topWords = Array.from(doc.wordCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([word, count]) => `${word}: ${count}`)
			.join(', ');

		line1.nodeValue = `ID: ${doc.id}`;
		line2.nodeValue = `x: ${doc.position.x.toFixed(2)}, y: ${doc.position.y.toFixed(2)}`;
		line3.nodeValue = `Top words: ${topWords}`;

		popover.style.left = `${event.pageX}px`;
		popover.style.top = `${event.pageY}px`;
		popover.classList.add('popover--visible');

	}

	function hidePopover() {

		if (popover === null) {
			return;
		}

		popover.classList.remove('popover--visible');

	}

	function destroy() {
		if (popover === null) {
			return;
		}
		popover.remove();
		popover = null;
	}

	return {
		showPopover,
		hidePopover,
		destroy,
	};

}
