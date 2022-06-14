const options = {
    timeInMsForEachPoint: 60000,
    timeInMsForPenaltyPoints: 5000,
    timeBetweenSync: 10000,
    iconUrl: "images/128_icon.png"
};

let hpStage = 0;

//Chrome storage variables.
initializeAllVariables();

//Check hp every couple of seconds:
setInterval(syncHp, options.timeBetweenSync)

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

//When popup is opened:

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message.popupOpen) {
        syncHp();
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

function syncHp(){

    chrome.storage.sync.get(["dead"], function(items) {
        if(items.dead === false){
            syncAdditionalPointsForTime();
            syncPenaltyTimer();

            chrome.storage.sync.get(["hp"], function(items) {
                let hp = items.hp;

                if(hpStage !== 0 && hp > 75){
                    setHpStageBasedOnHp(hp);
                }
                if(hpStage <= 0 && hp < 75){
                    printStageNotification(hp);
                    setHpStageBasedOnHp(hp);
                }
                if(hpStage <= 1 && hp < 50){
                    printStageNotification(hp);
                    setHpStageBasedOnHp(hp);
                }
                if(hpStage <= 2 && hp < 25){
                    printStageNotification(hp);
                    setHpStageBasedOnHp(hp);
                }
                if(hpStage <= 3 && hp <= 0){
                    killThePet();
                    setHpStageBasedOnHp(hp);
                }
            });

        } else {

            waitToReviveThePet();

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
    } else if(hp >= 0) {
        hpStage = 3;
    } else {
        hpStage = 0;
    }
    console.log("Hp stage set to " + hpStage);
}

function printStageNotification(hp){

    printNotification("Pet losing hp!", "Yours pet hp is now: " + hp);

}

function printNotification(title, message){

    console.log("Printing a notification...");

    var opt = {
        type: "basic",
        title: title,
        message: message,
        iconUrl: options.iconUrl
    };

    chrome.notifications.create('hp_notification', opt, function (){});
}

//Kinda grim to think about it...
function killThePet(){

    printNotification("Your pet died!", "No more blacklisted sites!")
    chrome.storage.sync.set({ "dead": true }, function(){});
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

        let numberOfPoints = Math.floor(endTime / options.timeInMsForPenaltyPoints);
        endTime = endTime - options.timeInMsForPenaltyPoints * numberOfPoints;

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

        let penaltyPoints = Math.floor(endTime / options.timeInMsForPenaltyPoints);

        chrome.storage.sync.set({ "penaltyTime": 0 }, function(){});
        addHp(-penaltyPoints);
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
        let numberOfPoints = endTime / options.timeInMsForEachPoint;
        numberOfPoints = Math.floor(numberOfPoints);
        endTime = endTime - options.timeInMsForEachPoint * numberOfPoints;

        chrome.storage.sync.set({ "time": Date.now() - endTime }, function(){});
        addHp(numberOfPoints);
        chrome.runtime.sendMessage({synced: true});
    });
}

function waitToReviveThePet(){
    chrome.storage.sync.get(["time"], function(items){
        let endTime = Date.now();
        let startTime = items.time;

        if(startTime === undefined || isNaN(startTime) || startTime < 0){
            chrome.storage.sync.set({ "time": endTime }, function(){});
            return;
        }

        endTime -= startTime;
        let numberOfPoints = endTime / options.timeInMsForEachPoint;
        numberOfPoints = Math.floor(numberOfPoints);

        console.log("Waiting to revive with addhp = " + numberOfPoints);

        if(numberOfPoints >= 100){
            addHp(numberOfPoints);
            chrome.storage.sync.set({"dead": false}, function () {});
        }
        chrome.runtime.sendMessage({synced: true});
    });
}

function addHp(addedPoints) {
    let health;
    chrome.storage.sync.get(["hp"], function (items) {
        health = items.hp;
        health += addedPoints;

        if (health === undefined || isNaN(health) || health > 100) {
            health = 100;
        }

        if (health < 0) health = 0;

        chrome.storage.sync.set({"hp": health}, function () {});
    });
}

function initializeAllVariables(){

    chrome.storage.sync.get(["hp"], function(items) {
        if(items.hp === undefined || isNaN(items.hp) || items.hp > 100) {
            chrome.storage.sync.set({"hp": 100}, function () {});
        }
        setHpStageBasedOnHp(items.hp);
    });

    chrome.storage.sync.get(["time"], function(items) {
        if(items.time === undefined || isNaN(items.time)){
            chrome.storage.sync.set({"time": Date.now()}, function () {});
        }
    });

    chrome.storage.sync.get(["penaltyTime"], function(items) {
        if(items.penaltyTime === undefined || isNaN(items.penaltyTime)){
            chrome.storage.sync.set({"penaltyTime": 0}, function () {});
        }
    });

    chrome.storage.sync.get(["pet"], function(items) {
        if(items.pet === undefined || isNaN(items.pet)){
            chrome.storage.sync.set({"pet": "images/turtle_example/t"}, function () {});
        }
    });
}