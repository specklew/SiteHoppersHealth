//Send an event when popup is opened
chrome.runtime.sendMessage({popupOpen: true});

//Get hp bar from .html
var hpbar = new ldBar(".healthBar");

/*setTimeout(function(){
    chrome.storage.sync.get(["hp"], function(items){
        hpbar.set(items.hp, true);
        let imageNum = Math.ceil(10 - (items.hp - 1)/10);
        if(imageNum >= 11) imageNum = 10;
        if(imageNum <= 0) imageNum = 1;
        let imageSrc = "images/turtle_example/t" + imageNum + ".png";
        document.getElementById("turtle").src = imageSrc;
        console.log(imageSrc);
    });
}, 100)*/

chrome.storage.onChanged.addListener(function (message, sender, sendResponse) {
    console.log(message)
    if(message.hp){
        chrome.storage.sync.get(["hp"], function(items){
            hpbar.set(items.hp, true);
            let imageNum = Math.ceil(10 - (items.hp - 1)/10);
            if(imageNum >= 11) imageNum = 10;
            if(imageNum <= 0) imageNum = 1;
            let imageSrc = "images/turtle_example/t" + imageNum + ".png";
            document.getElementById("turtle").src = imageSrc;
            console.log(imageSrc);
        });
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message.synced) {
        chrome.storage.sync.get(["hp"], function(items){
            hpbar.set(items.hp, true);
            let imageNum = Math.ceil(10 - (items.hp - 1)/10);
            if(imageNum >= 11) imageNum = 10;
            if(imageNum <= 0) imageNum = 1;
            let imageSrc = "images/turtle_example/t" + imageNum + ".png";
            document.getElementById("turtle").src = imageSrc;
            console.log(imageSrc);
        });
    }
});