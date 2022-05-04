var health;
var startTime
var endTime;

chrome.storage.sync.get(["hp"], function(items){
    health = items.hp;
});

if(typeof health == 'undefined'){
    health = 100;
}

//start();

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

// function popupOpened(){
//     end();
//     start();
// }

chrome.tabs.onActivated.addListener(scanTabs);
chrome.tabs.onUpdated.addListener(scanTabs);
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