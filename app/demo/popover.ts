import { DatasetDocument } from '../core/types';


export interface PopoverController {
	showPopover: (event: PointerEvent, doc: DatasetDocument) => void;
	hidePopover: () => void;
	destroy: () => void;
}

export function createPopover(container: HTMLElement): PopoverController {

	let popover: HTMLDivElement | null = document.createElement('div');
	popover.classList.add('popover');
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

		popover.replaceChildren();
		popover.append(
			`ID: ${doc.id}`,
			document.createElement('br'),
			`x: ${doc.position.x.toFixed(2)}, y: ${doc.position.y.toFixed(2)}`,
			document.createElement('br'),
			`Top words: ${topWords}`,
		);

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
