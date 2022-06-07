const timeInMsForEachPoint = 60000;
const timeInMsForPenaltyPoints = 5000;
const notificationPopupDuration = 10000;
const timeBetweenSync = 10000;

let hpStage = 0;

//Check hp every couple of seconds:

setInterval(syncHp, timeBetweenSync)

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

chrome.storage.sync.get(["hp"], function(items) {setHpStageBasedOnHp(items.hp)});

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
        syncHp();
    }
});


function syncHp(){
    syncAdditionalPointsForTime();
    syncPenaltyTimer();

    chrome.storage.sync.get(["hp"], function(items) {
        let hp = items.hp;

        if(hpStage !== 0 && hp > 75){
            setHpStageBasedOnHp(hp);
        }

        if(hpStage <= 0 && hp < 75){
            printNotification(hp);
            setHpStageBasedOnHp(hp);
        }
        if(hpStage <= 1 && hp < 50){
            printNotification(hp);
            setHpStageBasedOnHp(hp);
        }
        if(hpStage <= 2 && hp < 25){
            printNotification(hp);
            setHpStageBasedOnHp(hp);
        }
    });
}

function setHpStageBasedOnHp(hp){
    if(hp >= 75){
        hpStage = 0;
    } else if(hp >= 50){
        hpStage = 1;
    } else if(hp >= 25){
        hpStage = 2;
    } else {
        hpStage = 3;
    }
    console.log("Hp stage set to " + hpStage);
}

function printNotification(hp){

    console.log("Creating a notification...");

    var opt = {
        type: "basic",
        title: "Pet losing hp!",
        message: "Yours pet hp is now: " + hp,
        iconUrl: "images/128_icon.png"
    }

    chrome.notifications.create('hp_notification', opt, function (){})

/*    (async () => {
        console.log("The notification is being displayed!");
        // create and show the notification
        const showNotification = () => {
            // create a new notification
            const notification = new Notification('JavaScript Notification API', {
                body: "Hey man, stop, you're hurting me! My hp is now: " + hp + "!!"
            });

            // close the notification after 10 seconds
            setTimeout(() => {
                notification.close();
            }, notificationPopupDuration);

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

    })();*/
}

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

        let numberOfPoints = Math.floor(endTime / timeInMsForPenaltyPoints);
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

        let penaltyPoints = Math.floor(endTime / timeInMsForPenaltyPoints);

        chrome.storage.sync.set({ "penaltyTime": 0 }, function(){});
        addHp(-penaltyPoints);
    });
}

function calculatePenaltyPoints(startTime, endTime){

    if(startTime === undefined || isNaN(startTime) || startTime <= 0){
        chrome.storage.sync.set({ "penaltyTime": 0 }, function(){});
        return;
    }
    endTime -= startTime;

    return Math.floor(endTime / timeInMsForPenaltyPoints);
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
    chrome.storage.sync.get(["hp"], function(items) {
        health = items.hp;
        health += addedPoints;

        if (health === undefined || isNaN(health) || health > 100) {
            health = 100;
        }

        if(health < 0) health = 0;

        chrome.storage.sync.set({ "hp": health }, function(){});
    });
}