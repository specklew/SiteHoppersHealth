const parser = document.createElement('a');
parser.href = window.location.href;

chrome.storage.sync.get(["blacklist"], function(items) {

    const blackListedWebsites = items.blacklist;

    if(blackListedWebsites === undefined) return;

    if(blackListedWebsites.includes(parser.hostname)){
        chrome.storage.sync.get(["dead"], function(items) {
            if (items.dead === true) {
                addOverlay();
            }
        });
    }

});

function addOverlay(){
    console.log("Overlay added.");

    const overlay = document.createElement("div");
    overlay.setAttribute('id', 'site_hoppers_overlay');
    overlay.setAttribute(
        'style',
        '\n' +
        'position: fixed; \n' +
        'display: block; \n' +
        'width: 100%; \n' +
        'height: 100%; \n' +
        'top: 0;\n' +
        'left: 0;\n' +
        'right: 0;\n' +
        'bottom: 0;\n' +
        'background-color: rgba(0,0,0,0.94); \n' +
        'z-index: 2; \n' +
        'cursor: pointer; \n' +
        'display: table;'
    );

    document.body.appendChild(overlay);
    console.log(overlay);

    const verticalDiv = document.createElement("div");
    verticalDiv.setAttribute('style', 'vertical-align:middle; display: table-cell;');

    overlay.appendChild(verticalDiv);

    const text = document.createElement("h1");
    text.setAttribute(
        'style',
        '\n' +
        'text-align:center; \n' +
        'vertical-align:middle; \n' +
        'color: rgb(255, 255, 255);'
    );
    text.innerHTML = "You can't use this site because your pet is dead!";

    verticalDiv.appendChild(text);
    console.log(text);
}