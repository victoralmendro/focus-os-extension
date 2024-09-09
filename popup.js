/*
^https?:\/\/music\.youtube\.com
^https?:\/\/studio\.youtube\.com
^https?:\/\/(www\.)?youtube\.com

^https?:\/\/(www\.)?youtube\.com\/feed\/subscriptions
^https?:\/\/(www\.)?youtube\.com\/feed\/history
^https?:\/\/(www\.)?youtube\.com\/playlist\?list=
*/
document.addEventListener('DOMContentLoaded', async function() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          
        if(request.hasOwnProperty("action") && request.action == "updateCurrentUrlTime"){
            const formatedTime = formatTime(request.updateCurrentUrlTime);
            document.getElementById("active-url").innerText  = `Active Tab URL Time: ${formatedTime}`;
        }
    });

    var btnOpenRulesPage = document.getElementById("btn-open-rules");

    btnOpenRulesPage.addEventListener("click", ()=>{
        chrome.tabs.create({
            url: chrome.runtime.getURL('pages/rules-page/rulesPage.html')
        });
    });

    var btnOpenWhitelistPage = document.getElementById("btn-open-whitelist");

    btnOpenWhitelistPage.addEventListener("click", ()=>{
        chrome.tabs.create({
            url: chrome.runtime.getURL('pages/white-list-page/whiteListPage.html')
        });
    });
});