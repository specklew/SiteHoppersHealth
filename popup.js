var hpbar = new ldBar(".healthBar");

// chrome.runtime.sendMessage({request: "checkHealth"}, function(response) {
//     hpbar.set(response.hp, true);
// });

chrome.storage.sync.get(["hp"], function(items){
    hpbar.set(items.hp, true);
});
