



const parser = document.createElement('a');
parser.href = window.location.href;

chrome.storage.sync.get(["blacklist"], function(items) {

    const blackListedWebsites = items.blacklist;

    if(blackListedWebsites === undefined) return;

    if(blackListedWebsites.includes(parser.hostname)){
        chrome.storage.sync.get(["dead"], function(items) {
            if (items.dead === true) {
                clearPageFromContent();
            }
        });
    }

});

function clearPageFromContent(){
    console.log("Overlay added.");

    const overlay = document.createElement("div");
    overlay.setAttribute('id', 'site_hoppers_overlay');
    overlay.setAttribute(
        'style',
        '\n' +
        '  position: fixed; \n' +
        '  display: block; \n' +
        '  width: 100%; \n' +
        '  height: 100%; \n' +
        '  top: 0;\n' +
        '  left: 0;\n' +
        '  right: 0;\n' +
        '  bottom: 0;\n' +
        '  background-color: rgba(0,0,0,0.9); \n' +
        '  z-index: 2; \n' +
        '  cursor: pointer; \n'
    )

    document.body.appendChild(overlay);
    console.log(overlay);
}