import kosVocab from '../data/vocab.kos.txt';
import kosDocWord from '../data/docword.kos.txt';
import kosBowPca from '../data/embeddings.bow.pca.kos.txt';
import kosBowTsne from '../data/embeddings.bow.tsne.kos.txt';
import kosTfidfPca from '../data/embeddings.tfidf.pca.kos.txt';
import kosTfidfTsne from '../data/embeddings.tfidf.tsne.kos.txt';

import enronVocab from '../data/vocab.enron.txt';
import enronDocWord from '../data/docword.enron.txt';
import enronBowPca from '../data/embeddings.bow.pca.enron.txt';
import enronBowTsne from '../data/embeddings.bow.tsne.enron.txt';
import enronTfidfPca from '../data/embeddings.tfidf.pca.enron.txt';
import enronTfidfTsne from '../data/embeddings.tfidf.tsne.enron.txt';


export type CorpusName = "kos" | "enron";

export type PreprocessingMethod = "tfidf" | "bow";

export type EmbeddingMethod = "tsne" | "pca";

export interface CorpusFiles {
	vocabFile: string;
	docWordFile: string;
	embeddingFiles: Record<PreprocessingMethod, Record<EmbeddingMethod, string>>;
}


export const corpora: Record<CorpusName, CorpusFiles> = {
	kos: {
		vocabFile: kosVocab,
		docWordFile: kosDocWord,
		embeddingFiles: {
			tfidf: {
				tsne: kosTfidfTsne,
				pca: kosTfidfPca,
			},
			bow: {
				tsne: kosBowTsne,
				pca: kosBowPca,
			},
		},
	},
	enron: {
		vocabFile: enronVocab,
		docWordFile: enronDocWord,
		embeddingFiles: {
			tfidf: {
				tsne: enronTfidfTsne,
				pca: enronTfidfPca,
			},
			bow: {
				tsne: enronBowTsne,
				pca: enronBowPca,
			},
		},
	},
};
