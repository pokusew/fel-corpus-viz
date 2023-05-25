import React from 'react';

import { Dataset } from '../core/types';


export interface DatasetOverviewProps {
	dataset: Dataset;
}

export const DatasetOverview = ({ dataset }: DatasetOverviewProps) => {

	return (
		<div className="dataset-overview">
			<h1 className="dataset-name">{dataset.corpusName}</h1>
			<div className="stats">
				<div className="stats-value">
					<div className="name">
						num words in vocabulary
					</div>
					<div className="value">
						{dataset.vocabSize}
					</div>
				</div>
				<div className="stats-value">
					<div className="name">
						num docs
					</div>
					<div className="value">
						{dataset.documents.length}
					</div>
				</div>
			</div>
		</div>
	);

};

export default DatasetOverview;

