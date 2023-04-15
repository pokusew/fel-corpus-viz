"use strict";


export interface ServiceWorkerDetails {
	name: string;
	cacheName: string;
}

export const NAME_GET_DETAILS_REQUEST = 1;

export const TYPE_REQUEST = 1;
export const TYPE_REPLY = 1;

export interface AbstractMessage {
	id: number;
	type: typeof TYPE_REQUEST | typeof TYPE_REPLY;
	name: number;
	error: string | undefined;
}

export interface GetDetailsReply extends AbstractMessage {
	name: typeof NAME_GET_DETAILS_REQUEST;
	data: ServiceWorkerDetails;
}

export type Message = GetDetailsReply | AbstractMessage;


export const registerServiceWorker = () => {

	// see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

	if (!('serviceWorker' in navigator)) {
		console.error(`[registerServiceWorker] Service Worker API not available!`);
		return;
	}

	// see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer

	navigator.serviceWorker.addEventListener('controllerchange', () => {
		console.log(`[registerServiceWorker] controllerchange: new controller = `, navigator.serviceWorker.controller?.scriptURL);
	});

	navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
		console.log(`[registerServiceWorker] message:`, event);
	});

	// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/startMessages
	navigator.serviceWorker.startMessages();

	navigator.serviceWorker.ready
		.then((registration: ServiceWorkerRegistration) => {
			console.log(`[registerServiceWorker] serviceWorker ready`);
		});

	navigator.serviceWorker.register('/sw.js')
		.then((registration: ServiceWorkerRegistration) => {
			console.log(`[registerServiceWorker] sw.js registered`);
		})
		.catch(err => {
			console.error(`[registerServiceWorker] sw.js registration failed:`, err);
		});

	// navigator.serviceWorker.controller?.postMessage()

};
