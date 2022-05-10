//Send an event when popup is opened
chrome.runtime.sendMessage({popupOpen: true});

//Get hp bar from .html
var hpbar = new ldBar(".healthBar");

//Set the hp bar to display hp stored in chrome storage settings
chrome.storage.sync.get(["hp"], function(items){
    hpbar.set(items.hp, true);
});