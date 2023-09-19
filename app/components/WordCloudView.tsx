import React, { useMemo } from 'react';

import { DatasetDocument, SelectedWords } from '../core/types';

import WordCloudWrapper from './WordCloudWrapper';
import DocumentOverview from './DocumentOverview';

import IconXmarkLight from '-!svg-react-loader?name=IconMinimizeLight!../images/icons/xmark-light.svg';


export interface WordCloudViewParams {
	mode: 'compare' | 'union' | 'intersection';
	documents: DatasetDocument[];
}

export interface WordCloudViewProps {
	params: WordCloudViewParams;
	onClose: () => void;
	selectedWords: SelectedWords;
	onSelectedWordsChange: (words: SelectedWords) => void;
}

export const WordCloudView = ({ params, onClose, selectedWords, onSelectedWordsChange }: WordCloudViewProps) => {

	const documents = params.documents;

	const [allWords, commonWords]: [SelectedWords, SelectedWords] = useMemo(() => {

		const allWords = new Set<string>();
		const commonWords = new Set<string>();

		documents.forEach(doc => {
			for (const w of doc.wordCounts.keys()) {
				allWords.add(w);
				let isCommon = true;
				for (const otherDoc of documents) {
					if (otherDoc === doc) {
						continue;
					}
					if (!otherDoc.wordCounts.has(w)) {
						isCommon = false;
						break;
					}
				}
				if (isCommon) {
					commonWords.add(w);
				}
			}
		});

		return [allWords, commonWords];

	}, [documents]);

	return (
		<div className="wordcloud-view">
			<div className="wordcloud-view-header">
				<button
					type="button"
					className="btn btn-danger close-btn"
					onClick={onClose}
				>
					<IconXmarkLight className="icon" aria-hidden={true} />
					<span className="sr-only">Close</span>
				</button>
				<h1>{params.mode[0].toUpperCase()}{params.mode.slice(1)}</h1>
				<div className="stats">
					<div className="stats-value">
						<div className="name">
							num all words
						</div>
						<div className="value">
							{allWords.size}
						</div>
					</div>
					<div className="stats-value">
						<div className="name">
							num common words
						</div>
						<div className="value">
							{commonWords.size}
						</div>
					</div>
				</div>
			</div>
			<div className="wordcloud-view-container">
				{documents.map(doc => (
					<div key={doc.id} className="document-wrapper">
						<DocumentOverview document={doc} />
						<WordCloudWrapper
							document={doc}
							onSelectedWordsChange={onSelectedWordsChange}
							selectedWords={selectedWords}
							commonWords={commonWords}
						/>
					</div>
				))}
			</div>
		</div>
	);

};

export default WordCloudView;
