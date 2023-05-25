import { CorpusName, EmbeddingMethod, PreprocessingMethod } from './corpora';


export interface Position {
	x: number;
	y: number;
}

export interface DatasetDocument {
	id: number;
	wordCounts: Map<string, number>;
	position: Position;
}

export interface DatasetDescriptor {
	corpusName: CorpusName;
	preprocessingMethod: PreprocessingMethod;
	embeddingMethod: EmbeddingMethod;
}

export interface Dataset extends DatasetDescriptor {
	documents: DatasetDocument[];
	vocabSize: number;
}

export type SelectedPoints = Set<number>;
export type SelectedWords = Set<string>;
