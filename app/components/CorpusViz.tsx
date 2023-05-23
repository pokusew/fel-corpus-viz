"use strict";

import React, { useEffect, useState } from 'react';
import { getIntAndIncrement } from '../helpers/counter';
import { ScatterplotWrapper } from './scatterplot';
import { InfoScreen } from './common';
import { Dataset, loadDataset } from '../demo/load-dataset';
import { CorpusName, EmbeddingMethod, PreprocessingMethod } from '../demo/corpora';


export interface QueryOperationLoading {
	status: 'loading';
}

export interface QueryOperationSuccess<T> {
	status: 'success';
	data: T;
}

export interface QueryOperationError {
	status: 'error';
	error: any;
}

export type QueryOperation<T> = QueryOperationLoading | QueryOperationSuccess<T> | QueryOperationError;


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

const CorpusViz = () => {

	const [datasetQuery, setDatasetQuery] = useState<QueryOperation<Dataset>>({ status: 'loading' });

	const [corpusName, setCorpusName] = useState<CorpusName>("enron");
	const [preprocessingMethod, setPreprocessingMethod] = useState<PreprocessingMethod>("bow");
	const [embeddingMethod, setEmbeddingMethod] = useState<EmbeddingMethod>("pca");

	console.log(`[App] dataset query`, datasetQuery);

	useEffect(() => {

		const debugId = getIntAndIncrement('App:dataset');

		console.log(`[App] effect ${debugId}: run`);

		let ignore = false;

		loadDataset({
			corpusName,
			preprocessingMethod,
			embeddingMethod,
		})
			.then((dataset) => {
				if (ignore) {
					console.log(`[App] effect ${debugId}: ignoring fetch result`);
					return;
				}
				console.log(`[App] effect ${debugId}: dataset loaded, datasetSize = ${dataset.documents.length}`);
				setDatasetQuery({ status: 'success', data: dataset });
			})
			.catch((error) => {
				if (ignore) {
					console.log(`[App] effect ${debugId}: ignoring fetch error`);
					return;
				}
				console.error(`[App] effect ${debugId}: error while loading dataset`, error);
				setDatasetQuery({ status: 'error', error });
			});

		return () => {
			console.log(`[App] effect ${debugId}: cleanup`);
			ignore = true;
		};

	}, [corpusName, preprocessingMethod, embeddingMethod]);

	return (
		<main className="app-content">
			{datasetQuery.status === 'loading' && (
				<InfoScreen status="loading" message="Loading dataset ..." />
			)}
			{datasetQuery.status === 'error' && (
				<InfoScreen status="error">Error: {datasetQuery.error}</InfoScreen>
			)}
			{datasetQuery.status === 'success' && (
				<ScatterplotWrapper
					data={datasetQuery.data.documents}
				/>
			)}
			<div className="app-controls">
				{datasetQuery.status === 'success' && (
					<DatasetOverview
						dataset={datasetQuery.data}
					/>
				)}
			</div>
		</main>
	);

};

export default CorpusViz;
