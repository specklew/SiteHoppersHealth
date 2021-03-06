//Send an event when popup is opened
chrome.runtime.sendMessage({popupOpen: true});

//Get hp bar from .html
var hpbar = new ldBar(".healthBar");

updatePopup();

chrome.storage.onChanged.addListener(function (message, sender, sendResponse) {
    console.log(message)
    if(message.hp || message.synced){
        updatePopup();
    }
});

function updatePopup(){
    chrome.storage.sync.get(["hp"], function(items){
        hpbar.set(items.hp, true);

        if(items.hp <= 0)
        {
            document.getElementById("turtle").src = "images/rip/rip1.png";
            return;
        }

        chrome.storage.sync.get(["pet"], function(items2){

            let imageNum = Math.ceil(10 - (items.hp - 1)/10);
            if(imageNum >= 11) imageNum = 10;
            if(imageNum <= 0) imageNum = 1;
            document.getElementById("turtle").src = items2.pet + imageNum + ".png";
        });
    });
}