import { DatasetInfo } from '../data/datasets';


interface Position {
	x: number;
	y: number;
}

interface DatasetDocument {
	id: number;
	wordCounts: Map<string, number>;
	position: Position;
}

interface Dataset {
	name: string;
	documents: DatasetDocument[];
	vocabSize: number;
}


async function loadDataset(datasetInfo: DatasetInfo): Promise<Dataset> {

	const {
		embeddingsFile,
		vocabFile,
		bowFile,
	} = datasetInfo;


	const [embeddingsData, vocabulary, bowData] = await Promise.all([
		loadDatasetFile(embeddingsFile),
		loadDatasetFile(vocabFile),
		loadDatasetFile(bowFile),
	]);

	// load preprocessed document embeddings
	const docPositions: Position[] = [];
	for (const line of embeddingsData) {
		const parts = line.split(' ').map(Number);
		docPositions.push({ x: parts[1], y: parts[2] });
	}

	// load bags or words for documents

	const documents: DatasetDocument[] = [];

	for (const line of bowData.slice(3)) {
		const [docId, wordId, wordCount] = line.split(' ').map(Number);
		const docIdx = docId - 1;

		// create a new entry for the current document
		if (!documents[docIdx]) {
			documents[docIdx] = {
				id: Number(docId),
				wordCounts: new Map<string, number>(),
				position: docPositions[docIdx],
			};
		}

		// add the word count to the current document
		const word = vocabulary[wordId - 1];
		documents[docIdx].wordCounts.set(word, wordCount);
	}

	return {
		name: datasetInfo.name,
		documents,
		vocabSize: vocabulary.length,
	};
}

async function loadDatasetFile(path: string): Promise<string[]> {
	try {
		// const response = await fetch(`../data/${fileName}`);
		const response = await fetch(path);
		const data = await response.text();
		return data.split('\n');
	} catch (error) {
		throw new Error(`Error fetching file: ${error}`);
	}
}

export { loadDataset, Dataset, DatasetDocument };
