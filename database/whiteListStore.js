const WhiteListStore = function(localDatabase){
    const STORE_NAME = "Whitelist";

    this.insert = async function(rule, isActive) {
        return new Promise(async (resolve, reject) => {
            let db;
        
            try {
                db = await localDatabase.ensureDatabaseReady();
            } catch (error) {
                return reject(error);
            }
        
            const transaction = db.transaction([STORE_NAME], "readwrite");
        
            transaction.oncomplete = function(event) {
                resolve("Transaction completed successfully");
            };
        
            transaction.onerror = function(event) {
                reject(event.target.errorCode);
            };
        
            const objectStore = transaction.objectStore(STORE_NAME);
            const entry = {
                id: crypto.randomUUID(),
                rule: rule,
                isActive: isActive
            };
        
            const request = objectStore.add(entry);
        
            request.onerror = function(event) {
                reject(event.target.errorCode);
            };
        });
    }
    
    this.update = async function(id, rule, isActive) {
        return new Promise(async (resolve, reject) => {
            let db;
        
            try {
                db = await localDatabase.ensureDatabaseReady();
            } catch (error) {
                return reject(error);
            }
        
            const transaction = db.transaction([STORE_NAME], "readwrite");
        
            transaction.oncomplete = function(event) {
                resolve("Entry updated successfully");
            };
        
            transaction.onerror = function(event) {
                reject(event.target.errorCode);
            };
        
            const objectStore = transaction.objectStore(STORE_NAME);
        
            const request = objectStore.get(id);
        
            request.onsuccess = function(event) {
                const entry = event.target.result;
            
                if (entry) {
                    entry.rule = rule;
                    entry.isActive = isActive;
            
                    const updateRequest = objectStore.put(entry);
            
                    updateRequest.onsuccess = function(event) {
                        resolve("Entry updated successfully");
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
            
                    if ("isActive" in filters && entry.isActive !== filters.isActive) {
                        match = false;
                    }

                    if ("rule" in filters && entry.rule !== filters.rule) {
                        match = false;
                    }
                    
                    if ("id" in filters && entry.id !== filters.id) {
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

    this.findByRule = async function(rule) {
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
            let result = undefined;
            const request = objectStore.openCursor();
        
            request.onsuccess = function(event) {
                const cursor = event.target.result;
        
                if (cursor) {
                    const entry = cursor.value;
                    let match = true;
            
                    if (rule !== entry.rule) {
                        match = false;
                    }
            
                    if (match) {
                        result = entry;
                    }
            
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };
        
            request.onerror = function(event) {
                reject(event.target.errorCode);
            };
        });
    }

    this.findById = async function(id) {
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
            let result = undefined;
            const request = objectStore.openCursor();
        
            request.onsuccess = function(event) {
                const cursor = event.target.result;
        
                if (cursor) {
                    const entry = cursor.value;
                    let match = true;
            
                    if (id !== entry.id) {
                        match = false;
                    }
            
                    if (match) {
                        result = entry;
                    }
            
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };
        
            request.onerror = function(event) {
                reject(event.target.errorCode);
            };
        });
    }

    this.delete = async function(id) {
        return new Promise(async (resolve, reject) => {
            let db;
        
            try {
                db = await localDatabase.ensureDatabaseReady();
            } catch (error) {
                return reject(error);
            }
        
            const transaction = db.transaction([STORE_NAME], "readwrite");
        
            transaction.oncomplete = function(event) {
                resolve("Entry deleted successfully");
            };
        
            transaction.onerror = function(event) {
                reject(event.target.errorCode);
            };
        
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.delete(id);
        
            request.onsuccess = function(event) {
                resolve("Entry deleted successfully");
            };
        
            request.onerror = function(event) {
                reject(event.target.errorCode);
            };
        });
    }
}