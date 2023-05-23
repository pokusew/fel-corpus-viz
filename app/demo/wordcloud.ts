import { Position } from './types';
import { scaleLinear } from 'd3-scale';


const minFontSize = 15;
const maxFontSize = 70;

export function calculateFontSizes(wordCounts: Map<string, number>): Map<string, number> {
	// get the minimum and maximum word counts
	const counts = Array.from(wordCounts.values());
	const minCount = Math.min(...counts);
	const maxCount = Math.max(...counts);

	const mapping = scaleLinear()
		.domain([minCount, maxCount])
		.range([minFontSize, maxFontSize]);

	// calculate the font size for each word
	const wordSizes = new Map<string, number>();
	wordCounts.forEach((count, word) => {
		// const fontSize = ((count - minCount) / (maxCount - minCount)) * (maxFontSize - minFontSize) + minFontSize;
		const fontSize = mapping(count);
		wordSizes.set(word, fontSize);
	});

	return wordSizes;
}


export function generateWordPositions(wordSizes: Map<string, number>, width: number, height: number): Map<string, Position> {

	const wordPositions = new Map<string, Position>();
	// start at the center of the SVG
	const center: Position = { x: width / 2, y: height / 2 };
	const sortedWordSizes = new Map(Array.from(wordSizes.entries()).sort((a, b) => b[1] - a[1]));

	// we want the center of the first word to be in the center, not its top-left corner
	const firstWord = Array.from(sortedWordSizes.keys())[0];
	const firstWordSize = sortedWordSizes.get(firstWord)!;
	const estimatedFirstWordSize = estimateTextSize(firstWord, firstWordSize);
	center.x -= estimatedFirstWordSize.width / 2;
	center.y -= estimatedFirstWordSize.height / 2;

	sortedWordSizes.forEach((fontSize, word) => {
		// start at the center for each word
		let position: Position = { ...center };
		// angle for the spiral
		let angle = 0;
		// how much to step away from the center each time
		const step = 4;

		wordPositions.set(word, position);

		// keep going along the spiral until we find a position that doesn't overlap
		while (checkWordCollisions(word, wordPositions, sortedWordSizes)) {
			angle += 0.1;
			const x = center.x + step * angle * Math.cos(angle);
			const y = center.y + step * angle * Math.sin(angle);
			position = { x, y };
			// update the word position
			wordPositions.set(word, position);
		}
	});

	return wordPositions;
}

interface Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

function calculateAverageCharacterWidth(word: string): number {
	const characterWidths = {
		'a': 0.527, 'b': 0.57, 'c': 0.461, 'd': 0.57, 'e': 0.517, 'f': 0.319, 'g': 0.57,
		'h': 0.57, 'i': 0.233, 'j': 0.233, 'k': 0.526, 'l': 0.233, 'm': 0.87, 'n': 0.57,
		'o': 0.57, 'p': 0.57, 'q': 0.57, 'r': 0.368, 's': 0.435, 't': 0.35, 'u': 0.57,
		'v': 0.5, 'w': 0.764, 'x': 0.526, 'y': 0.5, 'z': 0.435,
	};

	const totalWidth = Array.from(word).reduce((sum, char) => {
		const width = characterWidths[char.toLowerCase()] || 0.6; // Default to 0.6 if character width is not specified
		return sum + width;
	}, 0);

	return totalWidth / word.length;
}

export function estimateTextSize(word: string, fontSize: number): { width: number, height: number } {
	const averageCharacterWidth = calculateAverageCharacterWidth(word);
	const estimatedWidth = word.length * fontSize * averageCharacterWidth;

	return {
		width: estimatedWidth,
		height: fontSize,
	};
}

function checkWordCollisions(
	word: string, wordPositions: Map<string, Position>, wordSizes: Map<string, number>,
): boolean {
	const wordPosition = wordPositions.get(word)!;
	const wordFontSize = wordSizes.get(word)!;
	const wordRect: Rectangle = { ...wordPosition, ...estimateTextSize(word, wordFontSize) };

	for (const otherWord of wordPositions.keys()) {
		if (word === otherWord) {
			continue;
		}

		const otherWordPosition = wordPositions.get(otherWord)!;
		const otherWordFontSize = wordSizes.get(otherWord)!;
		const otherWordRect: Rectangle = {
			...otherWordPosition,
			...estimateTextSize(otherWord, otherWordFontSize),
		};

		if (checkRectangleOverlap(wordRect, otherWordRect)) {
			return true;
		}
	}
	return false;
}

function checkRectangleOverlap(rect1: Rectangle, rect2: Rectangle, margin: number = 4): boolean {
	return !(rect1.x > rect2.x + rect2.width + margin ||
		rect1.x + rect1.width + margin < rect2.x ||
		rect1.y > rect2.y + rect2.height + margin ||
		rect1.y + rect1.height + margin < rect2.y);
}
