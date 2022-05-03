var hpbar = new ldBar(".healthBar");

chrome.runtime.sendMessage({request: "checkHealth"}, function(response) {
    hpbar.set(response.hp, true);
});