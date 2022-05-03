function scanTabs() {
    chrome.tabs.query({ //This method output active URL 
        "active": true,
        "currentWindow": true,
        "status": "complete",
        "windowType": "normal"
    }, function (tabs) {
        for (tab in tabs) {
            var parser = document.createElement('a');

            parser.href = tabs[tab].url;
            console.log(parser.hostname);
        }
    });
}

chrome.tabs.onActivated.addListener(scanTabs);
chrome.tabs.onUpdated.addListener(scanTabs);