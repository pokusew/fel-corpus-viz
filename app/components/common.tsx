"use strict";

import React from 'react';
import { isDefined } from '../helpers/common';
import classNames from 'classnames';


// common UI components

export interface InfoScreenProps
	extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	className?: any;
	status?: 'loading' | 'success' | 'error' | 'warning';
	message?: string;
}

export const InfoScreen = (
	{
		status,
		message,
		children,
		className,
		...otherProps
	}: InfoScreenProps,
) => (
	<div className={classNames({
		'info-screen': true,
		'screen-loading': status === 'loading',
		'screen-success': status === 'success',
		'screen-error': status === 'error',
		'screen-warning': status === 'warning',
	}, className)} {...otherProps}>
		{status === 'loading' && (
			<div className="sk-flow">
				<div className="sk-flow-dot"></div>
				<div className="sk-flow-dot"></div>
				<div className="sk-flow-dot"></div>
			</div>
		)}
		{isDefined(message) && <div className="message">{message}</div>}
		{children}
	</div>
);