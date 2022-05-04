var hpbar = new ldBar(".healthBar");

chrome.storage.sync.get(["hp"], function(items){
    hpbar.set(items.hp, true);
});