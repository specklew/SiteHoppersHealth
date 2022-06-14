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
        chrome.storage.sync.get(["pet"], function(items2){
            hpbar.set(items.hp, true);
            let imageNum = Math.ceil(10 - (items.hp - 1)/10);
            if(imageNum >= 11) imageNum = 10;
            if(imageNum <= 0) imageNum = 1;
            let imageSrc = items2.pet + imageNum + ".png";

            document.getElementById("turtle").src = imageSrc;
        });
    });
}