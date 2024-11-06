importScripts("database/localDatabase.js");
importScripts("database/rulesStore.js");
importScripts("database/whiteListStore.js");
importScripts("database/timeTableStore.js");
importScripts("utils/dateUtils.js");
importScripts("utils/timeUtils.js");
importScripts("services/timeTableService.js");

const MIN_INTERVAL_TO_CHECK_PAGE_IN_SECS = 1;
var rulesRoutine;

async function manageContentScript(activeTab){
    const existingScripts = await chrome.scripting.getRegisteredContentScripts();
    if(existingScripts.length == 0){
        await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ["contentScript/blockerManager.js"]
        });
    }else{
        await chrome.scripting.updateContentScripts([{
            id: "blocker-manager"
        }]);
    }
}

async function startRulesRoutine(){
    const localDatabase = new LocalDatabase();
    console.log("Loading DB...");
    await localDatabase.ensureDatabaseReady();
    console.log("DB loaded");;
    const rulesStore = new RulesStore(localDatabase);
    const whiteListStore = new WhiteListStore(localDatabase);
    const timeTableStore = new TimeTableStore(localDatabase);

    rulesRoutine = setInterval(()=>{

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if(tabs.length == 0)
                return;

            let activeTab = tabs[0];
            let activeTabUrl = {};
            try {
                activeTabUrl = new URL(activeTab.url);

                if(activeTabUrl.protocol != "https:" && activeTabUrl.protocol != "http:"){
                    return;
                }

                await manageContentScript(activeTab);

            } catch (e) {
                return;
            }

            const activeWhiteList = await whiteListStore.select({isActive: true});  

            for(i=0;i < activeWhiteList.length; i++){
                
                const whiteListItem = activeWhiteList[i];
                const regexResult = new RegExp(whiteListItem.rule).test(activeTabUrl.href);

                if(regexResult){
                    chrome.action.setBadgeText({ text: "W" });
                    try{
                        chrome.tabs.sendMessage(activeTab.id, { action: 'unblockPage' }, (response)=>{});
                    }catch(ex){}
                    return;
                }
            }

            const activeRules = await rulesStore.select({isActive: true});

            let modifiedTimeTable = {};
            let todayStartEndOfDay = DateUtils.getInitialAndFinalDate(new Date());

            for(i=0;i < activeRules.length;i++){
                const dbRule = activeRules[i];
                const regexResult = new RegExp(dbRule.rule).test(activeTabUrl.href);

                if(regexResult){
                    const queryResult = await TimeTableService.getDateUsageByRule(dbRule.id, todayStartEndOfDay.initial, todayStartEndOfDay.final);

                    if(queryResult.length > 0){
                        modifiedTimeTable = await timeTableStore.update(queryResult[0].id, MIN_INTERVAL_TO_CHECK_PAGE_IN_SECS);
                    }else{
                        modifiedTimeTable = await timeTableStore.insert(dbRule.id, activeTabUrl.hostname, MIN_INTERVAL_TO_CHECK_PAGE_IN_SECS);
                    }

                    try{
                        if(modifiedTimeTable.totalTime >= dbRule.maxDailyUsageTimeSeconds){
                            chrome.tabs.sendMessage(activeTab.id, { action: 'blockPage' }, (response)=>{});
                        }else{
                            chrome.tabs.sendMessage(activeTab.id, { action: 'unblockPage' }, (response)=>{});
                        }
                    }catch(ex){}

                    break;
                }
            }

            if("totalTime" in modifiedTimeTable){
                chrome.action.setBadgeText({ text: TimeUtils.formatTime(modifiedTimeTable.totalTime) });
            }else{
                chrome.action.setBadgeText({ text: "" });
            }
        });

    }, MIN_INTERVAL_TO_CHECK_PAGE_IN_SECS*1000);
}

chrome.runtime.onInstalled.addListener(async () => {
    console.log("Extension installed and ready!");

    chrome.alarms.create("keepAlive", { periodInMinutes: 1 });

    startRulesRoutine();
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        chrome.action.setBadgeText({ text: "" });
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "keepAlive") {
        console.log(`Background worker is alive! ${new Date()}`);
        
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                try{
                    chrome.tabs.sendMessage(tab.id, { action: 'keepAlive' }, (response) => {
                        console.log(`Tab responded! ${new Date()}`);

                        if(rulesRoutine == undefined || rulesRoutine == null){
                            startRulesRoutine();
                        }
                    });
                }catch(ex){}
            });
        });
    }
});

chrome.management.onEnabled.addListener(()=>{
    if(rulesRoutine == undefined || rulesRoutine == null){
        startRulesRoutine();
    } 
});