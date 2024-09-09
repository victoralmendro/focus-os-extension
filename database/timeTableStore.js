const TimeTableStore = function(localDatabase){
    const STORE_NAME = "TimeTable";

    this.insert = async function(ruleId, hostname, elapsedTime) {
        return new Promise(async (resolve, reject) => {
            let db;
        
            try {
                db = await localDatabase.ensureDatabaseReady();
            } catch (error) {
                return reject(error);
            }
        
            const transaction = db.transaction([STORE_NAME], "readwrite");
        
            transaction.oncomplete = function(event) {
                resolve(entry);
            };
        
            transaction.onerror = function(event) {
                reject(event.target.errorCode);
            };
        
            const objectStore = transaction.objectStore(STORE_NAME);
            const entry = {
                id: crypto.randomUUID(),
                ruleId: ruleId,
                hostname: hostname,
                totalTime: elapsedTime,
                updatedAtUtc: DateUtils.convertLocalDateToUTCIgnoringTimezone(new Date())
            };
        
            const request = objectStore.add(entry);
        
            request.onerror = function(event) {
                reject(event.target.errorCode);
            };
        });
    }
    
    this.update = async function(timeTableId, elapsedTime) {
        return new Promise(async (resolve, reject) => {
            let db;
        
            try {
                db = await localDatabase.ensureDatabaseReady();
            } catch (error) {
                return reject(error);
            }
        
            const transaction = db.transaction([STORE_NAME], "readwrite");
        
            transaction.oncomplete = function(event) {
                resolve("Update completed successfully");
            };
        
            transaction.onerror = function(event) {
                reject(event.target.errorCode);
            };
        
            const objectStore = transaction.objectStore(STORE_NAME);
        
            const request = objectStore.get(timeTableId);
        
            request.onsuccess = function(event) {
                const entry = event.target.result;
            
                if (entry) {
                    entry.updatedAtUtc = DateUtils.convertLocalDateToUTCIgnoringTimezone(new Date());
                    entry.totalTime += elapsedTime;
            
                    const updateRequest = objectStore.put(entry);
            
                    updateRequest.onsuccess = function(event) {
                        resolve(entry);
                    };
            
                    updateRequest.onerror = function(event) {
                        reject(event.target.errorCode);
                    };
                } else {
                    reject("Entry not found");
                }
            };
        
            request.onerror = function(event) {
                reject(event.target.errorCode);
            };
        });
    }

    this.select = async function(filters) {
        return new Promise(async (resolve, reject) => {
            let db;
        
            try {
                db = await localDatabase.ensureDatabaseReady();
            } catch (error) {
                return reject(error);
            }
        
            const transaction = db.transaction([STORE_NAME], "readonly");
        
            transaction.onerror = function(event) {
                reject(event.target.errorCode);
            };
        
            const objectStore = transaction.objectStore(STORE_NAME);
            const results = [];
            const request = objectStore.openCursor();
        
            request.onsuccess = function(event) {
                const cursor = event.target.result;
        
                if (cursor) {
                    const entry = cursor.value;
                    let match = true;
            
                    if ("id" in filters && entry.id !== filters.id) {
                        match = false;
                    }

                    if ("ruleId" in filters && entry.ruleId !== filters.ruleId) {
                        match = false;
                    }
                    
                    if ("hostname" in filters && entry.hostname !== filters.hostname) {
                        match = false;
                    }

                    if (
                        "initialDateUtc" in filters && "finalDateUtc" in filters
                        && 
                        entry.updatedAtUtc.getTime() <= filters.initialDateUtc.getTime() || entry.updatedAtUtc.getTime() >= filters.finalDateUtc.getTime()
                    ) {
                        match = false;
                    }
            
                    if (match) {
                        results.push(entry);
                    }
            
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
        
            request.onerror = function(event) {
                reject(event.target.errorCode);
            };
        });
    }

    this.updateItemToYesterday = async function(timeTableId) {
        return new Promise(async (resolve, reject) => {
            let db;
        
            try {
                db = await localDatabase.ensureDatabaseReady();
            } catch (error) {
                return reject(error);
            }
        
            const transaction = db.transaction([STORE_NAME], "readwrite");
        
            transaction.oncomplete = function(event) {
                resolve("Update completed successfully");
            };
        
            transaction.onerror = function(event) {
                reject(event.target.errorCode);
            };
        
            const objectStore = transaction.objectStore(STORE_NAME);
        
            const request = objectStore.get(timeTableId);
        
            request.onsuccess = function(event) {
                const entry = event.target.result;
            
                if (entry) {
                    var yesterday = new Date();
                    yesterday.setDate(yesterday.getDate()-1);

                    entry.updatedAtUtc = DateUtils.convertLocalDateToUTCIgnoringTimezone(yesterday);
                    entry.totalTime = 5000;
            
                    const updateRequest = objectStore.put(entry);
            
                    updateRequest.onsuccess = function(event) {
                        resolve(entry);
                    };
            
                    updateRequest.onerror = function(event) {
                        reject(event.target.errorCode);
                    };
                } else {
                    reject("Entry not found");
                }
            };
        
            request.onerror = function(event) {
                reject(event.target.errorCode);
            };
        });
    }
}