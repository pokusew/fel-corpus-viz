import { Position } from './types';
import { scaleLinear } from 'd3-scale';


const minFontSize = 15;
const maxFontSize = 70;

export function calculateFontSizes(wordCounts: Map<string, number>): Map<string, number> {
	// get the minimum and maximum word counts
	const counts = Array.from(wordCounts.values());
	const minCount = Math.min.apply(null, counts);
	const maxCount = Math.max.apply(null, counts);

	const fontSizeScale = scaleLinear()
		.domain([minCount, maxCount])
		.range([minFontSize, maxFontSize]);

	// calculate the font size for each word
	const wordSizes = new Map<string, number>();
	wordCounts.forEach((count, word) => {
		// const fontSize = ((count - minCount) / (maxCount - minCount)) * (maxFontSize - minFontSize) + minFontSize;
		const fontSize = fontSizeScale(count);
		wordSizes.set(word, fontSize);
	});

	return wordSizes;
}


interface PositionSize extends Position {
	width: number;
	height: number;
}


export function generateWordCloudPositions(
	fontSizes: Map<string, number>,
	plotWidth: number,
	plotHeight: number,
): Map<string, PositionSize> {

	const words = Array.from(fontSizes.keys());

	// start at the center of the SVG
	const sortedWords = words.sort((a, b) => fontSizes.get(b)! - fontSizes.get(a)!);

	const center: Position = {
		x: plotWidth / 2,
		y: plotHeight / 2,
	};

	// how much to step away from the center each time
	const stepSize = 4;

	const wordPositions = new Map<string, PositionSize>();
	// move each word away from the center until it doesn't overlap with any other words
	sortedWords.forEach(word => {
		const fontSize = fontSizes.get(word)!;
		const wordSize = estimateTextSize(word, fontSize);
		// we want the center of the word to be in the center, not its top-left corner
		const wordCenter = {
			x: center.x - wordSize.width / 2,
			y: center.y - wordSize.height / 2,
		};
		const position = {
			...wordCenter,
			width: wordSize.width,
			height: wordSize.height,
		};

		// angle for the spiral
		let angle = 0;

		wordPositions.set(word, position);

		// keep going along the spiral until we find a position that doesn't overlap
		while (checkWordCollisions(word, wordPositions)) {
			angle += 0.1;
			// update the word position
			position.x = wordCenter.x + stepSize * angle * Math.cos(angle);
			position.y = wordCenter.y + stepSize * angle * Math.sin(angle);
		}
	});

	return wordPositions;
}

export function estimateTextSize(word: string, fontSize: number): { width: number, height: number } {
	const averageCharacterWidth = calculateAverageCharacterWidth(word);
	const estimatedWidth = word.length * fontSize * averageCharacterWidth;

	return {
		width: estimatedWidth,
		height: fontSize,
	};
}

function checkWordCollisions(word: string, wordPositions: Map<string, PositionSize>): boolean {
	const wordPosition = wordPositions.get(word)!;

	for (const otherWord of wordPositions.keys()) {
		if (word === otherWord) {
			continue;
		}

		const otherWordPosition = wordPositions.get(otherWord)!;
		if (checkOverlap(wordPosition, otherWordPosition)) {
			return true;
		}
	}
	return false;
}

function checkOverlap(rect1: PositionSize, rect2: PositionSize, margin: number = 4): boolean {
	return !(rect1.x > rect2.x + rect2.width + margin ||
		rect1.x + rect1.width + margin < rect2.x ||
		rect1.y > rect2.y + rect2.height + margin ||
		rect1.y + rect1.height + margin < rect2.y);
}


function calculateAverageCharacterWidth(word: string): number {
	const characterWidths = {
		'a': 0.527, 'b': 0.57, 'c': 0.461, 'd': 0.57, 'e': 0.517, 'f': 0.319, 'g': 0.57,
		'h': 0.57, 'i': 0.233, 'j': 0.233, 'k': 0.526, 'l': 0.233, 'm': 0.87, 'n': 0.57,
		'o': 0.57, 'p': 0.57, 'q': 0.57, 'r': 0.368, 's': 0.435, 't': 0.35, 'u': 0.57,
		'v': 0.5, 'w': 0.764, 'x': 0.526, 'y': 0.5, 'z': 0.435,
	};

	const totalWidth = Array.from(word).reduce((sum, char) => {
		const width = characterWidths[char.toLowerCase()] ?? 0.6; // default to 0.6 if character width is not specified
		return sum + width;
	}, 0);

	return totalWidth / word.length;
}
