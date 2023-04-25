
interface DocumentEmbedding {
	id: number;
	x: number;
	y: number;
}

async function loadDataFromFile(path: string): Promise<DocumentEmbedding[]> {
	try {
		const response = await fetch(path);
		const data = await response.text();

		const lines = data.split('\n');
		const documentEmbeddings: DocumentEmbedding[] = [];

		for (const line of lines) {
			if (line.trim() === '') {
				continue;
			}

			const parts = line.split(' ').map(Number);
			const documentEmbedding: DocumentEmbedding = {
				id: parts[0],
				x: parts[1],
				y: parts[2],
			};

			documentEmbeddings.push(documentEmbedding);
		}

		return documentEmbeddings;
	} catch (error) {
		throw new Error(`Error fetching file: ${error}`);
	}
}

export { loadDataFromFile, DocumentEmbedding };
