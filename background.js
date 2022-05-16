const timeInMsForEachPoint = 60000;

//If page tab is activated or updated run the code below:
chrome.tabs.onActiveChanged.addListener(scanTabs);
chrome.tabs.onUpdated.addListener(scanTabs);

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${newValue}".`
        );
    }
});

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
            chrome.storage.sync.get(["hp"], function(items){
                console.log(parser.hostname + " hp = " + items.hp);
            });

            chrome.storage.sync.get(["blacklist"], function(items) {
                const blackListedWebsites = items.blacklist;

                if(blackListedWebsites.includes(parser.hostname)){
                    addHp(-1);
                    syncPointsForTime();
                }
            });
        }
    });
}

//When popup is opened:
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message.popupOpen) {
        syncPointsForTime();
    }
});

function syncPointsForTime() {
    chrome.storage.sync.get(["time"], function(items){
        let endTime = Date.now();
        let startTime = items.time;

        if(startTime === undefined || isNaN(startTime) || startTime < 0){
            chrome.storage.sync.set({ "time": endTime }, function(){});
            return false;
        }

        endTime -= startTime;
        let numberOfPoints = endTime / timeInMsForEachPoint;
        numberOfPoints = Math.floor(numberOfPoints);
        endTime = endTime - timeInMsForEachPoint * numberOfPoints;

        chrome.storage.sync.set({ "time": Date.now() - endTime }, function(){});
        addHp(numberOfPoints);
    });
}

function addHp(addedPoints){
    let health;
    chrome.storage.sync.get(["hp"], function(items){
        health = items.hp;
        health += addedPoints;

        if(health === undefined || isNaN(health) || health > 100){
            health = 100;
        }

        if(health < 0) health = 0;

        chrome.storage.sync.set({ "hp": health }, function(){});
    });
}