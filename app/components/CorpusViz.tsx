"use strict";

import React, { ChangeEventHandler, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { getIntAndIncrement } from '../helpers/counter';
import { Scatterplot, ScatterplotWrapper, SelectedPoints, SelectedWords } from './scatterplot';
import { InfoScreen } from './common';
import { loadDataset } from '../core/load-dataset';
import { CorpusName, EmbeddingMethod, PreprocessingMethod } from '../core/corpora';
import { Dataset, DatasetDocument } from '../core/types';
import { WordCloudWrapper } from './wordcloud';
import { IS_DEVELOPMENT } from '../helpers/common';
import IconXmarkLight from '-!svg-react-loader?name=IconMinimizeLight!../images/icons/xmark-light.svg';
import ObjectUnionSolidLight from '-!svg-react-loader?name=IconMinimizeLight!../images/icons/object-union-solid.svg';
import CirclesOverlapRegular
	from '-!svg-react-loader?name=IconMinimizeLight!../images/icons/circles-overlap-regular.svg';
import ObjectsColumnSolid from '-!svg-react-loader?name=IconMinimizeLight!../images/icons/objects-column-solid.svg';
import IconFileLinesRegular from '-!svg-react-loader?name=IconMinimizeLight!../images/icons/file-lines-regular.svg';
import IconFontCaseRegular from '-!svg-react-loader?name=IconMinimizeLight!../images/icons/font-case-regular.svg';
import IconFilterRegular from '-!svg-react-loader?name=IconMinimizeLight!../images/icons/filter-regular.svg';
import IconFilterSlashRegular from '-!svg-react-loader?name=IconMinimizeLight!../images/icons/filter-slash-regular.svg';


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

export interface WordcloudViewParams {
	mode: 'compare' | 'union' | 'intersection';
	documents: DatasetDocument[];
}

export interface WordcloudViewProps {
	params: WordcloudViewParams;
	onClose: () => void;
	selectedWords: SelectedWords;
	onSelectedWordsChange: (words: SelectedWords) => void;
}

export const WordcloudView = ({ params, onClose, selectedWords, onSelectedWordsChange }: WordcloudViewProps) => {

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
					<div className="document-wrapper">
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
		<form className="dataset-selector">


			<label
				className="form-control-label"
				htmlFor={`${formId}-corpusName`}
			>
				Corpus name:
			</label>
			<select
				className="form-control"
				id={`${formId}-corpusName`}
				name="corpusName"
				value={corpusName}
				onChange={handleCorpusNameChange}
			>
				{corporaNames.map(name => (
					<option key={name} value={name}>{name}</option>
				))}
			</select>


			<label
				className="form-control-label"
				htmlFor={`${formId}-preprocessingMethod`}
			>
				Preprocessing method:
			</label>
			<select
				className="form-control"
				id={`${formId}-preprocessingMethod`}
				name="preprocessingMethod"
				value={preprocessingMethod}
				onChange={handlePreprocessingMethodChange}
			>
				{preprocessingMethods.map(name => (
					<option key={name} value={name}>{name}</option>
				))}
			</select>


			<label
				className="form-control-label"
				htmlFor={`${formId}-embeddingMethod`}
			>
				Embedding method:
			</label>
			<select
				className="form-control"
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

	const [datasetQuery, setDatasetQuery] = useState<QueryOperation<Dataset>>({ status: 'loading' });

	const [selectedPoints, setSelectedPoints] = useState<SelectedPoints>(new Set<number>());
	const [selectedWords, setSelectedWords] = useState<SelectedWords>(new Set<string>());

	const [shouldFilter, setShouldFilter] = useState<number>(0);

	const handleSelectedPointsChange = useCallback((newSelectedPoints) => {
		setSelectedPoints(newSelectedPoints);
	}, []);

	const handleSelectedWordsChange = useCallback((newSelectedWords) => {
		setSelectedWords(newSelectedWords);
	}, []);

	const [wordcloudViewParams, setWordcloudViewParams] = useState<WordcloudViewParams | null>(null);

	const handleWordcloudViewClose = useCallback(() => {
		setWordcloudViewParams(null);
	}, []);

	const scatterplotRef = useRef<Scatterplot | null>(null);

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

	const handleCorpusNameChange = useCallback((newCorpusName: CorpusName) => {
		setDatasetQuery({ status: 'loading' });
		setCorpusName(newCorpusName);
		setWordcloudViewParams(null);
		setShouldFilter(0);
		setSelectedPoints(new Set());
		setSelectedWords(new Set());
	}, []);

	const handlePreprocessingMethodChange = useCallback((newPreprocessingMethod: PreprocessingMethod) => {
		setDatasetQuery({ status: 'loading' });
		setPreprocessingMethod(newPreprocessingMethod);
		// setSelectedPoints(new Set());
		// setSelectedWords(new Set());
	}, []);

	const handleEmbeddingMethodChange = useCallback((newEmbeddingMethod: EmbeddingMethod) => {
		setDatasetQuery({ status: 'loading' });
		setEmbeddingMethod(newEmbeddingMethod);
		// setSelectedPoints(new Set());
		// setSelectedWords(new Set());
	}, []);

	// note: we always render the ScatterplotWrapper component so that is not recreated when changing datasets
	//       (but it is hidden under the loading/error screen)
	return (
		<main className={`app-content filter-mode-${shouldFilter}`}>
			<ScatterplotWrapper
				ref={scatterplotRef}
				data={datasetQuery.status === 'success' ? datasetQuery.data.documents : undefined}
				onSelectedPointsChange={handleSelectedPointsChange}
				selectedPoints={selectedPoints}
				selectedWords={selectedWords}
			/>
			{wordcloudViewParams !== null && (
				<WordcloudView
					params={wordcloudViewParams}
					onClose={handleWordcloudViewClose}
					onSelectedWordsChange={handleSelectedWordsChange}
					selectedWords={selectedWords}
				/>
			)}
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
					<>
						<DatasetOverview
							dataset={datasetQuery.data}
						/>
						<div className="controls-section">
							<div className="controls-section-heading">
								<IconFileLinesRegular className="icon" aria-hidden={true} />
								<div className="text">Selected documents</div>
								<div className="count">{selectedPoints.size}</div>
								<button
									type="button"
									className="btn clear"
									onClick={(event) => {
										event.preventDefault();
										setSelectedPoints(new Set());
									}}
								>
									<IconXmarkLight className="icon" aria-hidden={true} />
									<span className="sr-only">Remove all documents from selection</span>
								</button>
							</div>
							<div className="selection">
								{[...selectedPoints].map(id => (
									<div
										key={id}
										className="doc doc--clickable"
										onClick={(event) => {
											event.preventDefault();
											scatterplotRef.current?.zoomToPoint(id);
										}}
									>
								<span className="doc-name">
									#{id}
								</span>
										<button
											type="button"
											className="btn doc-remove"
											onClick={(event) => {
												event.preventDefault();
												event.stopPropagation();
												setSelectedPoints(prev => {
													const copy = new Set(prev);
													copy.delete(id);
													return copy;
												});
											}}
										>
											<IconXmarkLight className="icon" aria-hidden={true} />
											<span className="sr-only">Remove document {id} from selection</span>
										</button>
									</div>
								))}
							</div>
							<div className="controls-section-toolbar">
								<button
									type="button"
									className="btn"
									onClick={(event) => {
										event.preventDefault();
										if (datasetQuery.status !== 'success') {
											return;
										}
										setWordcloudViewParams({
											mode: 'compare',
											documents: [...selectedPoints].map(id => datasetQuery.data.documents[id]),
										});
									}}
								>
									<ObjectsColumnSolid className="icon" aria-hidden={true} />
									<span className="sr-only">Compare selection</span>
									<span>Compare</span>
								</button>
								{/*<button*/}
								{/*	type="button"*/}
								{/*	className="btn"*/}
								{/*	onClick={(event) => {*/}
								{/*		event.preventDefault();*/}
								{/*		if (datasetQuery.status !== 'success') {*/}
								{/*			return;*/}
								{/*		}*/}
								{/*		setWordcloudViewParams({*/}
								{/*			mode: 'intersection',*/}
								{/*			documents: [...selectedPoints].map(id => datasetQuery.data.documents[id]),*/}
								{/*		});*/}
								{/*	}}*/}
								{/*>*/}
								{/*	<CirclesOverlapRegular className="icon" aria-hidden={true} />*/}
								{/*	<span className="sr-only">Show intersection</span>*/}
								{/*</button>*/}
								{/*<button*/}
								{/*	type="button"*/}
								{/*	className="btn"*/}
								{/*	onClick={(event) => {*/}
								{/*		event.preventDefault();*/}
								{/*		if (datasetQuery.status !== 'success') {*/}
								{/*			return;*/}
								{/*		}*/}
								{/*		setWordcloudViewParams({*/}
								{/*			mode: 'union',*/}
								{/*			documents: [...selectedPoints].map(id => datasetQuery.data.documents[id]),*/}
								{/*		});*/}
								{/*	}}*/}
								{/*>*/}
								{/*	<ObjectUnionSolidLight className="icon" aria-hidden={true} />*/}
								{/*	<span className="sr-only">Show union</span>*/}
								{/*</button>*/}
							</div>
						</div>
						<div className="controls-section">
							<div className="controls-section-heading">
								<IconFontCaseRegular className="icon" aria-hidden={true} />
								<div className="text">Selected words</div>
								<div className="count">{selectedWords.size}</div>
								<button
									type="button"
									className="btn clear"
									onClick={(event) => {
										event.preventDefault();
										setSelectedWords(new Set());
									}}
								>
									<IconXmarkLight className="icon" aria-hidden={true} />
									<span className="sr-only">Remove all words from selection</span>
								</button>
							</div>
							<div className="selection">
								{[...selectedWords].map(word => (
									<div
										key={word}
										className="doc"
									>
										<span className="doc-name">
											{word}
										</span>
										<button
											type="button"
											className="btn doc-remove"
											onClick={(event) => {
												event.preventDefault();
												event.stopPropagation();
												setSelectedWords(prev => {
													const copy = new Set(prev);
													copy.delete(word);
													return copy;
												});
											}}
										>
											<IconXmarkLight className="icon" aria-hidden={true} />
											<span className="sr-only">Remove word {word} from selection</span>
										</button>
									</div>
								))}
							</div>
							<div className="controls-section-toolbar">
								<button
									type="button"
									className="btn"
									onClick={(event) => {
										event.preventDefault();
										event.stopPropagation();
										setShouldFilter(prev => (prev + 1) % 3);
									}}
								>
									<IconFilterRegular className="icon" aria-hidden={true} />
									<span className="sr-only">Filter</span>
									<span>Filter mode: {shouldFilter}</span>
								</button>
								{/*<button type="button" className="btn">*/}
								{/*	<CirclesOverlapRegular className="icon" aria-hidden={true} />*/}
								{/*	<span className="sr-only">Highlight</span>*/}
								{/*	<span>Highlight</span>*/}
								{/*</button>*/}
							</div>
						</div>
					</>
				)}
			</div>
		</main>
	);

};

export default CorpusViz;
