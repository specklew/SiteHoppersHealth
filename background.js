const timeInMsForEachPoint = 60000;
const timeInMsForPenaltyPoints = 5000;

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

            chrome.storage.sync.get(["blacklist"], function(items) {
                const blackListedWebsites = items.blacklist;

                if(blackListedWebsites === undefined) return;

                if(blackListedWebsites.includes(parser.hostname)){
                    console.log("Blacklisted website: " + parser.hostname);
                    startPenaltyTimer();
                    syncAdditionalPointsForTime();
                }
                else
                {
                    console.log("Normal website: " + parser.hostname);
                    stopPenaltyTimer();
                }
            });
        }
    });
}

//When popup is opened:
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message.popupOpen) {
        syncAdditionalPointsForTime();
        syncPenaltyTimer();
    }
});

function startPenaltyTimer(){
    chrome.storage.sync.get(["penaltyTime"], function(items) {

        let startTime = items.penaltyTime;

        if(startTime === undefined || isNaN(startTime) || startTime <= 0){
            chrome.storage.sync.set({"penaltyTime": Date.now()}, function () {});
        }
    });
}

function syncPenaltyTimer(){
    chrome.storage.sync.get(["penaltyTime"], function(items){
        let endTime = Date.now();
        let startTime = items.penaltyTime;

        if(startTime === undefined || isNaN(startTime) || startTime <= 0){
            chrome.storage.sync.set({ "penaltyTime": 0 }, function(){});
            return;
        }

        endTime -= startTime;
        let numberOfPoints = endTime / timeInMsForPenaltyPoints;
        numberOfPoints = Math.floor(numberOfPoints);
        endTime = endTime - timeInMsForPenaltyPoints * numberOfPoints;

        chrome.storage.sync.set({ "penaltyTime": Date.now() - endTime }, function(){});
        addHp(-numberOfPoints);
        chrome.runtime.sendMessage({synced: true});
    });
}

function stopPenaltyTimer(){
    chrome.storage.sync.get(["penaltyTime"], function(items){
        let endTime = Date.now();
        let startTime = items.penaltyTime;

        if(startTime === undefined || isNaN(startTime) || startTime <= 0){
            chrome.storage.sync.set({ "penaltyTime": 0 }, function(){});
            return;
        }

        endTime -= startTime;
        let numberOfPoints = endTime / timeInMsForPenaltyPoints;
        numberOfPoints = Math.floor(numberOfPoints);

        chrome.storage.sync.set({ "penaltyTime": 0 }, function(){});
        addHp(-numberOfPoints);
    });
}

function syncAdditionalPointsForTime() {
    chrome.storage.sync.get(["time"], function(items){
        let endTime = Date.now();
        let startTime = items.time;

        if(startTime === undefined || isNaN(startTime) || startTime < 0){
            chrome.storage.sync.set({ "time": endTime }, function(){});
            return;
        }

        endTime -= startTime;
        let numberOfPoints = endTime / timeInMsForEachPoint;
        numberOfPoints = Math.floor(numberOfPoints);
        endTime = endTime - timeInMsForEachPoint * numberOfPoints;

        chrome.storage.sync.set({ "time": Date.now() - endTime }, function(){});
        addHp(numberOfPoints);
        chrome.runtime.sendMessage({synced: true});
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
        if(health%5===0)

            (async () => {
                // create and show the notification
                const showNotification = () => {
                    // create a new notification
                    const notification = new Notification('JavaScript Notification API', {
                        body: 'Hey man, stop, you just loose 5hp!!!'
                    });

                    // close the notification after 10 seconds
                    setTimeout(() => {
                        notification.close();
                    }, 10 * 1000);

                    // navigate to a URL when clicke
                }

                // show an error message
                const showError = () => {
                    const error = document.querySelector('.error');
                    error.style.display = 'block';
                    error.textContent = 'You blocked the notifications';
                }

                // check notification permission
                let granted = false;

                if (Notification.permission === 'granted') {
                    granted = true;
                } else if (Notification.permission !== 'denied') {
                    let permission = await Notification.requestPermission();
                    granted = permission === 'granted';
                }

                // show notification or error
                granted ? showNotification() : showError();

            })();

        if(health < 0) health = 0;

        chrome.storage.sync.set({ "hp": health }, function(){});
    });
}