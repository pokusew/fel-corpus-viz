import React, { ChangeEventHandler, useCallback, useId } from 'react';

import { CorpusName, EmbeddingMethod, PreprocessingMethod } from '../core/corpora';


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

export default DatasetSelector;
