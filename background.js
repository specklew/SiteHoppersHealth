let health;

//If the app is run for the first time:
chrome.storage.sync.get(["hp"], function(items){
    health = items.hp;
});

if(health === undefined || isNaN(health)){
    health = 100;
    chrome.storage.sync.set({ "hp": health }, function(){
    });
}

//If page tab is activated or updated run the code below:
chrome.tabs.onActivated.addListener(scanTabs);
chrome.tabs.onUpdated.addListener(scanTabs);

function scanTabs() {
    chrome.tabs.query({ //This method output active URL
        "active": true,
        "currentWindow": true,
        "status": "complete",
        "windowType": "normal"
    }, function (tabs) {
        for (let tab in tabs) {
            const parser = document.createElement('a');

            parser.href = tabs[tab].url;
            console.log(parser.hostname + " hp = " + health);
            if(parser.hostname === 'www.facebook.com'){
                health -= 1;
                //end();
                //start();
                chrome.storage.sync.set({ "hp": health }, function(){
                });
            }
        }
    });
}

//When popup is opened:
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message.popupOpen) {
        console.log("message = " + message);
    }
});

// chrome.browserAction.onClicked.addListener(popupOpened);

// function start() {
//     startTime = performance.now();
// };

// function end() {
//     endTime = performance.now();
//     var timeDiff = endTime - startTime;

//     timeDiff /= 1000; // strip the ms
//     timeDiff /= 10; // from s to min

//     var minutes = Math.round(timeDiff);
//     health += minutes;
// }
