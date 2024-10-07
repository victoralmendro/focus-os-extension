var CURRENT_VERSION = "5";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const olderBlocker = document.querySelector(`#focus-os-blocker:not([version='${CURRENT_VERSION}'])`);
    if(olderBlocker){
        olderBlocker.remove();
    }

    const blocker = document.getElementById("focus-os-blocker");

    if (request.action === "blockPage") {

        if(!blocker){
            createBlockerLayout();
        }

    }else if (request.action === "unblockPage" && blocker) {
        blocker.remove();

        if(document.body.hasAttribute("focus-os-scroll-blocker")){
            document.body.removeAttribute("focus-os-scroll-blocker");
            document.body.style.overflow = "";
        }
    }

    if (chrome.runtime.lastError) {
        console.log("Error in message handling: ", chrome.runtime.lastError);
    }

    sendResponse({});
});

function createBlockerLayout(){
    const newElement = document.createElement('div');
    newElement.id = "focus-os-blocker";
    newElement.innerHTML = "<p>Time limit reached!</p>";
    newElement.style.position = 'fixed';
    newElement.style.height = '100vh';
    newElement.style.width = '100vw';
    newElement.style.zIndex = '9000';
    newElement.style.backgroundColor = 'black';
    newElement.style.color = 'white';
    newElement.style.display = 'flex';
    newElement.style.justifyContent = 'center';
    newElement.style.alignItems = 'center';
    newElement.setAttribute("version", CURRENT_VERSION);

    document.body.appendChild(newElement);

    document.body.setAttribute("focus-os-scroll-blocker", "");
    document.body.style.overflow = "hidden"
}