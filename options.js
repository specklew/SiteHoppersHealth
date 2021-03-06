let previousURL;

window.addEventListener('load', () => {
    const url_form = document.querySelector("#new-URL-form");
    const url_input = document.querySelector("#new-URL-input");
    const list_el = document.querySelector("#URLs");

    chrome.storage.sync.get(["blacklist"], function(items) {
        let blacklist = items.blacklist;
        if(blacklist === undefined) blacklist = [];
        blacklist.forEach(site => addURLToList(site));
    });

    url_form.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputVal = url_input.value;

        addURLToList(inputVal);
        addToChromeBlacklist(inputVal);

        url_input.value = '';
    });

    function addURLToList(URL){
        const URL_el = document.createElement('div');
        URL_el.classList.add('URL');

        const URL_content_el = document.createElement('div');
        URL_content_el.classList.add('content');

        URL_el.appendChild(URL_content_el);

        const URL_input_el = document.createElement('input');
        URL_input_el.classList.add('text');
        URL_input_el.type = 'text';
        URL_input_el.value = URL;
        URL_input_el.setAttribute('readonly', 'readonly');

        URL_content_el.appendChild(URL_input_el);

        const URL_actions_el = document.createElement('div');
        URL_actions_el.classList.add('actions');

        const URL_edit_el = document.createElement('button');
        URL_edit_el.classList.add('edit');
        URL_edit_el.innerText = 'Edit';

        const URL_delete_el = document.createElement('button');
        URL_delete_el.classList.add('delete');
        URL_delete_el.innerText = 'Delete';

        URL_actions_el.appendChild(URL_edit_el);
        URL_actions_el.appendChild(URL_delete_el);

        URL_el.appendChild(URL_actions_el);

        list_el.appendChild(URL_el);

        URL_edit_el.addEventListener('click', (e) => {
            if (URL_edit_el.innerText.toLowerCase() === "edit") {
                previousURL = URL_input_el.value;
                URL_edit_el.innerText = "Save";
                URL_input_el.removeAttribute("readonly");
                URL_input_el.focus();
            } else {
                chrome.storage.sync.get(["blacklist"], function(items) {
                    let blacklist = items.blacklist;
                    if (blacklist === undefined) blacklist = [];
                    console.log("Trying to edit: " + previousURL);
                    let index = blacklist.indexOf(previousURL);
                    console.log(index);
                    if(index !== -1){
                        blacklist[index] = URL_input_el.value;
                        chrome.storage.sync.set({ "blacklist": blacklist }, function(){});
                    }
                });
                URL_edit_el.innerText = "Edit";
                URL_input_el.setAttribute("readonly", "readonly");
            }
        });

        URL_delete_el.addEventListener('click', (e) => {
            list_el.removeChild(URL_el);
            chrome.storage.sync.get(["blacklist"], function(items) {
                let blacklist = items.blacklist;
                if(blacklist === undefined) blacklist = [];
                console.log("Trying to delete: " + URL_input_el.value);
                let index = blacklist.indexOf(URL_input_el.value);
                console.log(index);
                if(index !== -1){
                    blacklist.splice(index, 1);
                    chrome.storage.sync.set({ "blacklist": blacklist }, function(){});
                }
            });
        });
    }

    //Pet selection

    const pet_form = document.querySelector("#pet-selection-form");

    pet_form.addEventListener('submit', (e) => {
        e.preventDefault();

        let checkboxes = document.querySelectorAll('input[name="flexRadioDefault"]:checked');
        let output = [];

        checkboxes.forEach((checkbox) => {
            output.push(checkbox.value);
        });

        chrome.storage.sync.set({"pet": output}, function () {});
    });
});

function addToChromeBlacklist(URL){
    chrome.storage.sync.get(["blacklist"], function(items) {
        const blacklist = items.blacklist;
        blacklist.push(URL);

        chrome.storage.sync.set({ "blacklist": blacklist }, function(){});
    });
    chrome.runtime.sendMessage({newBlacklistedItem: true});
}