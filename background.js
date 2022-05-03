var health = 100;

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
            if(parser.hostname == 'www.facebook.com'){
                health -= 1;
            }
        }
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.request == "checkHealth") {
        sendResponse({hp: health});
    }
});

chrome.tabs.onActivated.addListener(scanTabs);
chrome.tabs.onUpdated.addListener(scanTabs);