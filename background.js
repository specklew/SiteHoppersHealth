function scanTabs() {
    chrome.tabs.query({ //This method output active URL 
        "active": true,
        "currentWindow": true,
        "status": "complete",
        "windowType": "normal"
    }, function (tabs) {
        for (tab in tabs) {
            console.log(tabs[tab].url);
        }
    });
}

chrome.tabs.onActivated.addListener(scanTabs);
chrome.tabs.onUpdated.addListener(scanTabs);