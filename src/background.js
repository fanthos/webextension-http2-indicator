'use strict';

function onPageActionClicked (tab) {
}

function headersReceivedListener (details) {
	if (details.tabId == -1) return;
	let h2 = 'none';
	for (let header of details.responseHeaders) {
		if (header.name == 'x-firefox-spdy' && header.value) {
			h2 = header.value;
			break;
		}
	}
	//console.log(details.url, details.tabId, details.type, h2);
	browser.pageAction.setIcon({
		path: {
			'19': 'imgs/icon-' + h2 + '.png',
			'38': 'imgs/icon-' + h2 + '-scale2.png'
		},
		tabId: details.tabId
	});
	browser.pageAction.setTitle({
		title: 'Page loaded by: ' + h2,
		tabId: details.tabId
	});
	browser.pageAction.show(details.tabId);
}

function tabReplaced(details) {
	browser.pageAction.show(details.tabId);
}

browser.webRequest.onHeadersReceived.addListener(
	headersReceivedListener, {types: ["main_frame"], urls: ["<all_urls>"]}, ["responseHeaders"]
);

//browser.webNavigation.onTabReplaced.addListener(tabReplaced)