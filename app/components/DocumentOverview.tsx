import React from 'react';

import { DatasetDocument } from '../core/types';


export interface DocumentOverviewProps {
	document: DatasetDocument;
}

export const DocumentOverview = ({ document }: DocumentOverviewProps) => {

	return (
		<div className="document-overview">
			<h2 className="document-name">#{document.id}</h2>
			<div className="stats">
				<div className="stats-value">
					<div className="name">
						num unique words
					</div>
					<div className="value">
						{document.wordCounts.size}
					</div>
				</div>
			</div>
		</div>
	);

};

export default DocumentOverview;
