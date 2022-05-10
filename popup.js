//Send an event when popup is opened
chrome.runtime.sendMessage({popupOpen: true});

//Get hp bar from .html
var hpbar = new ldBar(".healthBar");

setTimeout(function(){
    chrome.storage.sync.get(["hp"], function(items){
        hpbar.set(items.hp, true);
        let imageSrc = "images/turtle_example/t" + Math.ceil(10 - (items.hp - 1)/10) + ".png";
        document.getElementById("turtle").src = imageSrc;
        console.log(imageSrc);
    });
}, 100)