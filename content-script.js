chrome.storage.sync.get(["dead"], function(items) {
    if (items.dead === true) {
        clearPageFromContent();
    }
    clearPageFromContent();
});

function clearPageFromContent(tab){
    console.log("Overlay added.");

    const overlay = document.createElement("div");
    overlay.setAttribute(
        'style',
        '{\n' +
        '  position: fixed; /* Sit on top of the page content */\n' +
        '  display: none; /* Hidden by default */\n' +
        '  width: 100%; /* Full width (cover the whole page) */\n' +
        '  height: 100%; /* Full height (cover the whole page) */\n' +
        '  top: 0;\n' +
        '  left: 0;\n' +
        '  right: 0;\n' +
        '  bottom: 0;\n' +
        '  background-color: rgba(0,0,0,0.5); /* Black background with opacity */\n' +
        '  z-index: 2; /* Specify a stack order in case you\'re using a different order for other elements */\n' +
        '  cursor: pointer; /* Add a pointer on hover */\n' +
        '}'
    )

    console.log(tab);
    document.body.appendChild(overlay);
}