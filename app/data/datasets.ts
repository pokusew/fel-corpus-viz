import embeddingsFileKos from '../data/doc_embeddings.kos.txt';
import vocabFileKos from '../data/vocab.kos.txt';
import bowFileKos from '../data/docword.kos.txt';


export interface DatasetInfo {
	name: string;
	embeddingsFile: string;
	vocabFile: string;
	bowFile: string;
}

export const kos: DatasetInfo = {
	name: 'kos',
	embeddingsFile: embeddingsFileKos,
	vocabFile: vocabFileKos,
	bowFile: bowFileKos,
};
