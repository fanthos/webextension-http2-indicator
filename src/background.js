'use strict';

var pageState = [];

const PAGE_NONE = 5;
const PAGE_DEFAULT = 1;
const PAGE_HTTP2 = 2;
const PAGE_HTTP2MAIN = 3;
const PAGE_SSL = 4;

const PAGE_STATE_TEXT = ['', 'not loaded', 'loaded using HTTP/2', 'loaded using HTTP/2 for main frame', 'loaded using SSL', 'not encrypted'];

function updatePageIcon(tabId) {
	setTimeout(()=>{
		var t = pageState[tabId];
		browser.pageAction.setIcon({
			path: {
				'19': 'imgs/icon-' + t + '.png',
				'38': 'imgs/icon-' + t + 'l.png'
			},
			tabId: tabId
		});
		browser.pageAction.setTitle({
			title: 'This page is ' + PAGE_STATE_TEXT[t],
			tabId: tabId
		});
		browser.pageAction.show(tabId);
		//console.log('icon updated', tabId, t);
	}, 0);
}

function onPageActionClicked(tab) {
}

function headersReceivedListener(details) {
	if (details.tabId == -1) return;
	//if (!pageState[details.tabId]) return;
	if (details.type == 'main_frame') {
		for (let header of details.responseHeaders) {
			if (header.name == 'x-firefox-spdy' && header.value == 'h2') {
				pageState[details.tabId] = PAGE_HTTP2;
				return;
			}
		}
		pageState[details.tabId] = PAGE_SSL;
		return;
	} else {
		if (pageState[details.tabId] == PAGE_HTTP2) {
			for (let header of details.responseHeaders) {
				if (header.name == 'x-firefox-spdy' && header.value == 'h2') {
					return;
				}
			}
			pageState[details.tabId] = PAGE_HTTP2MAIN;
			console.log('http/2 mixed', details.tabId, details.url)
			updatePageIcon(details.tabId);
			return;
		}
	}
	//updatePageIcon(details.tabId);
	//console.log(details.url, details.tabId, details.type, h2);
}
function headersReceivedListenerHttp(details) {
	if (details.tabId == -1) return;
	if (details.type == 'main_frame') {
		//if (pageState[details.tabId]) {
		pageState[details.tabId] = PAGE_NONE;
		//updatePageIcon(details.tabId);
		//}
	} else {
		if (pageState[details.tabId] == PAGE_HTTP2) {
			pageState[details.tabId] = PAGE_HTTP2MAIN;
			updatePageIcon(details.tabId);
		}
	}
	//console.log(details.url, details.tabId, details.type, h2);
}

browser.webRequest.onHeadersReceived.addListener(
	headersReceivedListener, { urls: ['https://*/*'] }, ['responseHeaders']
);
browser.webRequest.onHeadersReceived.addListener(
	headersReceivedListenerHttp, { urls: ['http://*/*'] }
);

browser.tabs.onCreated.addListener((tab) => {
	pageState[tab.id] = PAGE_DEFAULT;
	//console.log('tab created', tab.id);
});
browser.tabs.onRemoved.addListener((tabId) => {
	delete pageState[tabId];
	//console.log('tab removed', tabId);
});

/*
browser.webNavigation.onTabReplaced.addListener((details) => {
	browser.pageAction.show(details.tabId);
});
//*/
browser.webNavigation.onCommitted.addListener((details) => {
	if(details.frameId != 0) return;
	updatePageIcon(details.tabId);
	//console.log('tab naved', details.tabId, details.frameId, details.url);
});