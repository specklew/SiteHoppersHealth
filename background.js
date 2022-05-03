var health = 50;

chrome.storage.sync.get(["hp"], function(items){
    health = items.hp;
});

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
            if(parser.hostname == 'www.facebook.com'){
                health -= 1;
                                
                chrome.storage.sync.set({ "hp": health }, function(){
                });
            }
        }
    });
}

chrome.tabs.onActivated.addListener(scanTabs);
chrome.tabs.onUpdated.addListener(scanTabs);