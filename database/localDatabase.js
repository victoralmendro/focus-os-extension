const LocalDatabase = function (){
    const DB_NAME = "Focus OS";
    const DB_VERSION = 2;

    let db;

    var openDatabase = ()=>{
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
    
            request.onupgradeneeded = function(event) {
                db = event.target.result;
    
                if (!db.objectStoreNames.contains("Rules")) {
                    createStoreRules(db);
                } else {
                    upgradeStoreRules(event);
                }

                if (!db.objectStoreNames.contains("TimeTable")) {
                    createStoreTimeTable(db);
                }else {
                    upgradeStoreTimeTable(event);
                }
                
                if (!db.objectStoreNames.contains("Whitelist")) {
                    createStoreWhitelist(db);
                }
            };
    
            request.onsuccess = function(event) {
                db = event.target.result;
                resolve(db);
            };
    
            request.onerror = function(event) {
                reject(event.target.errorCode);
            };
        });
    }

    var createStoreRules = (db) => {
        const objectStore = db.createObjectStore("Rules", { keyPath: "id" });
                
        objectStore.createIndex("rule", "rule", { unique: false });
        objectStore.createIndex("isActive", "isActive", { unique: false });
        objectStore.createIndex("maxDailyUsageTimeSeconds", "maxDailyUsageTimeSeconds", { unique: false });
    }

    var upgradeStoreRules = (event) => {
        const transaction = event.target.transaction;
        const objectStore = transaction.objectStore("Rules");
    }

    var createStoreTimeTable = (db) => {
        const objectStore = db.createObjectStore("TimeTable", { keyPath: "id" });
                
        objectStore.createIndex("ruleId", "ruleId", { unique: false });
        objectStore.createIndex("totalTime", "totalTime", { unique: false });
        objectStore.createIndex("hostname", "hostname", { unique: false });
        objectStore.createIndex("updatedAtUtc", "updatedAtUtc", { unique: false });
    }

    var upgradeStoreTimeTable = (event) => {
        console.log(event);
        
        const transaction = event.target.transaction;
        const objectStore = transaction.objectStore("TimeTable");
    }

    var createStoreWhitelist = (db) => {
        const objectStore = db.createObjectStore("Whitelist", { keyPath: "id" });
                
        objectStore.createIndex("rule", "rule", { unique: false });
        objectStore.createIndex("isActive", "isActive", { unique: false });
    }

    this.ensureDatabaseReady = () => {
        if (db) {
            return Promise.resolve(db);
        }

        return openDatabase();
    }

    openDatabase();
}