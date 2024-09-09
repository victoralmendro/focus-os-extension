const WhiteListService = {
    /**
     * Saves a new rule or updates an existing one in the WhiteListStore.
     * 
     * @param {string} id - The id of the rule to be updated.
     * @param {string} rule - The rule to be saved or updated.
     * @param {boolean} isActive - The status of the rule (active or inactive).
     * @returns {Promise<Object>} - A promise that resolves to an object containing the status, message, and saved rule data.
     */
    save: async (id, rule, isActive)=>{
        const whiteListStore = new WhiteListStore(
            new LocalDatabase()
        );

        try {
            let existingRule = undefined;
            if(id && id !== ""){
                existingRule = await whiteListStore.findById(id);
                await whiteListStore.update(existingRule.id, rule, isActive);

                return {
                    status: "1",
                    message: "Sucess!",
                    data: existingRule
                };
            }

            existingRule = await whiteListStore.findByRule(rule);
            if(existingRule){
                return {
                    status: "0",
                    message: `Rule already exists`,
                };
            }

            await whiteListStore.insert(rule, isActive);
            existingRule = await whiteListStore.findByRule(rule);

            return {
                status: "1",
                message: "Sucess!",
                data: existingRule
            }; 
        } catch (error) {
            return {
                status: "0",
                message: `Failed to save the rule: ${error.message}`,
            };
        } 
    },
    /**
     * Escapes special characters in a string to make it safe for use in a regular expression.
     * 
     * @param {string} str - The string to escape.
     * @returns {string} - The escaped string.
     */
    escapeRegexString: (str) => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    /**
     * Retrieves all rules from the WhiteListStore.
     * 
     * @returns {Promise<Array>} - A promise that resolves to an array of all rules.
     */
    list: async (filters = {})=>{
        const whiteListStore = new WhiteListStore(
            new LocalDatabase()
        );

        return await whiteListStore.select(filters);
    },
     /**
     * Deletes a rule from the WhiteListStore by its ID.
     * 
     * @param {string} id - The ID of the rule to be deleted.
     * @returns {Promise<Object>} - A promise that resolves to an object containing the status and message of the delete operation.
     */
    delete: async (id) => {
        const whiteListStore = new WhiteListStore(
            new LocalDatabase()
        );

        try {
            await whiteListStore.delete(id);
            return {
                status: "1",
                message: "Success!",
            };
        } catch (error) {
            return {
                status: "0",
                message: `Failed to delete the rule: ${error.message}`,
            };
        }
    }
};