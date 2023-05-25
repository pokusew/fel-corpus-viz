"use strict";

import React, { ChangeEventHandler, useCallback, useEffect, useId, useState } from 'react';
import { getIntAndIncrement } from '../helpers/counter';
import { ScatterplotWrapper } from './scatterplot';
import { InfoScreen } from './common';
import { loadDataset } from '../demo/load-dataset';
import { CorpusName, EmbeddingMethod, PreprocessingMethod } from '../demo/corpora';
import { Dataset } from '../demo/types';
import { WordCloudWrapper } from './wordcloud';
import { IS_DEVELOPMENT } from '../helpers/common';


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


export interface DatasetSelectorProps {
	corpusName: CorpusName;
	preprocessingMethod: PreprocessingMethod;
	embeddingMethod: EmbeddingMethod;
	onCorpusNameChange: (corpusName: CorpusName) => void;
	onPreprocessingMethodChange: (preprocessingMethod: PreprocessingMethod) => void;
	onEmbeddingMethodChange: (embeddingMethod: EmbeddingMethod) => void;
}

const corporaNames: CorpusName[] = ['kos', 'enron'];
const preprocessingMethods: PreprocessingMethod[] = ['tfidf', 'bow'];
const embeddingMethods: EmbeddingMethod[] = ['pca', 'tsne'];

export const DatasetSelector = (
	{
		corpusName,
		preprocessingMethod,
		embeddingMethod,
		onCorpusNameChange,
		onPreprocessingMethodChange,
		onEmbeddingMethodChange,
	}: DatasetSelectorProps,
) => {

	const formId = useId();

	const handleCorpusNameChange = useCallback<ChangeEventHandler<HTMLSelectElement>>((event) => {
		if (corporaNames.includes(event.target.value as CorpusName)) {
			onCorpusNameChange(event.target.value as CorpusName);
		}
	}, [onCorpusNameChange]);

	const handlePreprocessingMethodChange = useCallback<ChangeEventHandler<HTMLSelectElement>>((event) => {
		if (preprocessingMethods.includes(event.target.value as PreprocessingMethod)) {
			onPreprocessingMethodChange(event.target.value as PreprocessingMethod);
		}
	}, [onPreprocessingMethodChange]);

	const handleEmbeddingMethodChange = useCallback<ChangeEventHandler<HTMLSelectElement>>((event) => {
		if (embeddingMethods.includes(event.target.value as EmbeddingMethod)) {
			onEmbeddingMethodChange(event.target.value as EmbeddingMethod);
		}
	}, [onEmbeddingMethodChange]);

	return (
		<form>

			<label htmlFor={`${formId}-corpusName`}>Corpus name:</label>
			<select
				id={`${formId}-corpusName`}
				name="corpusName"
				value={corpusName}
				onChange={handleCorpusNameChange}
			>
				{corporaNames.map(name => (
					<option key={name} value={name}>{name}</option>
				))}
			</select>

			<label htmlFor={`${formId}-preprocessingMethod`}>Preprocessing method:</label>
			<select
				id={`${formId}-preprocessingMethod`}
				name="preprocessingMethod"
				value={preprocessingMethod}
				onChange={handlePreprocessingMethodChange}
			>
				{preprocessingMethods.map(name => (
					<option key={name} value={name}>{name}</option>
				))}
			</select>

			<label htmlFor={`${formId}-embeddingMethod`}>Embedding method:</label>
			<select
				id={`${formId}-embeddingMethod`}
				name="embeddingMethod"
				value={embeddingMethod}
				onChange={handleEmbeddingMethodChange}
			>
				{embeddingMethods.map(name => (
					<option key={name} value={name}>{name}</option>
				))}
			</select>

		</form>
	);

};


const CorpusViz = () => {

	const [corpusName, setCorpusName] = useState<CorpusName>('kos');
	const [preprocessingMethod, setPreprocessingMethod] = useState<PreprocessingMethod>('bow');
	const [embeddingMethod, setEmbeddingMethod] = useState<EmbeddingMethod>('pca');

	const handleCorpusNameChange = useCallback((newCorpusName: CorpusName) => {
		setDatasetQuery({ status: 'loading' });
		setCorpusName(newCorpusName);
	}, []);

	const handlePreprocessingMethodChange = useCallback((newPreprocessingMethod: PreprocessingMethod) => {
		setDatasetQuery({ status: 'loading' });
		setPreprocessingMethod(newPreprocessingMethod);
	}, []);

	const handleEmbeddingMethodChange = useCallback((newEmbeddingMethod: EmbeddingMethod) => {
		setDatasetQuery({ status: 'loading' });
		setEmbeddingMethod(newEmbeddingMethod);
	}, []);

	const [datasetQuery, setDatasetQuery] = useState<QueryOperation<Dataset>>({ status: 'loading' });

	// IS_DEVELOPMENT && console.log(`[CorpusViz] render with dataset query`, datasetQuery);

	useEffect(() => {

		const effectId = getIntAndIncrement('CorpusViz:datasetFetchEffect');

		console.log(
			`[CorpusViz] fetch effect ${effectId}: run with params:`,
			corpusName, preprocessingMethod, embeddingMethod,
		);

		let ignore = false;

		loadDataset({
			corpusName,
			preprocessingMethod,
			embeddingMethod,
		})
			.then((dataset) => {
				if (ignore) {
					IS_DEVELOPMENT && console.log(`[CorpusViz] fetch effect ${effectId}: ignoring fetch result`);
					return;
				}
				console.log(
					`[CorpusViz] fetch effect ${effectId}: dataset loaded, datasetSize = ${dataset.documents.length}`,
				);
				setDatasetQuery({ status: 'success', data: dataset });
			})
			.catch((error) => {
				if (ignore) {
					console.log(`[CorpusViz] fetch effect ${effectId}: ignoring fetch error`);
					return;
				}
				console.error(`[CorpusViz] fetch effect ${effectId}: error while loading dataset`, error);
				setDatasetQuery({ status: 'error', error });
			});

		return () => {
			IS_DEVELOPMENT && console.log(`[CorpusViz] fetch effect ${effectId}: cleanup`);
			ignore = true;
		};

	}, [corpusName, preprocessingMethod, embeddingMethod]);

	// note: we always render the ScatterplotWrapper component so that is not recreated when changing datasets
	//       (but it is hidden under the loading/error screen)
	return (
		<main className="app-content">
			<ScatterplotWrapper
				data={datasetQuery.status === 'success' ? datasetQuery.data.documents : undefined}
			/>
			{datasetQuery.status === 'loading' && (
				<InfoScreen status="loading" className="app-scatterplot-screen" message="Loading dataset ..." />
			)}
			{datasetQuery.status === 'error' && (
				<InfoScreen status="error" className="app-scatterplot-screen">
					Error: {datasetQuery.error}
				</InfoScreen>
			)}
			<div className="app-controls">
				<DatasetSelector
					corpusName={corpusName}
					preprocessingMethod={preprocessingMethod}
					embeddingMethod={embeddingMethod}
					onCorpusNameChange={handleCorpusNameChange}
					onPreprocessingMethodChange={handlePreprocessingMethodChange}
					onEmbeddingMethodChange={handleEmbeddingMethodChange}
				/>
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
