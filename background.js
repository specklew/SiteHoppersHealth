const timeInMsForEachPoint = 60000;

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

        console.log("time set to = " + (Date.now() - endTime));
        chrome.storage.sync.set({ "time": Date.now() - endTime }, function(){});
        addHp(numberOfPoints);
    });
}

function addHp(addedPoints){
    let health;
    chrome.storage.sync.get(["hp"], function(items){
        health = items.hp;

        if(health === undefined || isNaN(health)){
            health = 100;
        }

        if(health + addedPoints > 100 || health + addedPoints < 0) return false;

        health += addedPoints;

        chrome.storage.sync.set({ "hp": health }, function(){});
    });
}