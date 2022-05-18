window.addEventListener('load', () => {
    const form = document.querySelector("#new-URL-form");
    const input = document.querySelector("#new-URL-input");
    const list_el = document.querySelector("#URLs");

    chrome.storage.sync.get(["blacklist"], function(items) {
        let blacklist = items.blacklist;
        if(blacklist === undefined) blacklist = [];
        blacklist.forEach(site => addURLToList(site));
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputVal = input.value;

        addURLToList(inputVal);
        addToChromeBlacklist(inputVal);

        input.value = '';
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
                URL_edit_el.innerText = "Save";
                URL_input_el.removeAttribute("readonly");
                URL_input_el.focus();
            } else {
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
});

function addToChromeBlacklist(URL){
    chrome.storage.sync.get(["blacklist"], function(items) {
        const blacklist = items.blacklist;
        blacklist.push(URL);

        chrome.storage.sync.set({ "blacklist": blacklist }, function(){});
    });
    chrome.runtime.sendMessage({newBlacklistedItem: true});
}