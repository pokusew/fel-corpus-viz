import { corpora, CorpusName, PreprocessingMethod, EmbeddingMethod } from './corpora';

interface Position {
	x: number;
	y: number;
}

interface DatasetDocument {
	id: number;
	wordCounts: Map<string, number>;
	position: Position;
}

export interface DatasetDescriptor {
	corpusName: CorpusName;
	preprocessingMethod: PreprocessingMethod;
	embeddingMethod: EmbeddingMethod;
}

interface Dataset extends DatasetDescriptor {
	documents: DatasetDocument[];
	vocabSize: number;
}

async function loadDataset(datasetDescriptor: DatasetDescriptor): Promise<Dataset> {

	const {
		corpusName,
		preprocessingMethod,
		embeddingMethod,
	} = datasetDescriptor;

	console.log("Loading dataset corpusName: ", corpusName, "preprocessingMethod: ", preprocessingMethod, "embeddingMethod: ", embeddingMethod);
	// retrieve the corresponding corpus files
	const { vocabFile, docWordFile, embeddingFiles } = corpora[corpusName];
	const embeddingsFile = embeddingFiles[preprocessingMethod][embeddingMethod];

	const [vocabulary, docWordData, embeddingsData] = await Promise.all([
		loadDatasetFile(vocabFile),
		loadDatasetFile(docWordFile),
		loadDatasetFile(embeddingsFile),
	]);

	// load and preprocess the dataset data

	// load preprocessed document embeddings
	const docPositions: Position[] = [];
	for (const line of embeddingsData) {
		const parts = line.split(' ').map(Number);
		docPositions.push({ x: parts[1], y: parts[2] });
	}

	// load bags or words for documents
	const documents: DatasetDocument[] = [];

	for (const line of docWordData.slice(3)) {
		const [docId, wordId, wordCount] = line.split(' ').map(Number);
		const docIdx = docId - 1;

		// create a new entry for the current document
		if (!documents[docIdx]) {
			documents[docIdx] = {
				id: docId,
				wordCounts: new Map<string, number>(),
				position: docPositions[docIdx],
			};
		}

		// add the word count to the current document
		const word = vocabulary[wordId - 1];
		documents[docIdx].wordCounts.set(word, wordCount);
	}

	return {
		corpusName,
		preprocessingMethod,
		embeddingMethod,
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
