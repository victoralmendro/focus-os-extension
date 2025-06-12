const RulesService = {
    /**
     * Saves a new rule or updates an existing one in the RulesStore.
     * 
     * @param {string} id - The id of the rule to be updated.
     * @param {string} rule - The rule to be saved or updated.
     * @param {boolean} isActive - The status of the rule (active or inactive).
     * @param {number} maxDailyUsageTime - Daily time limit the user can use the URL
     * @returns {Promise<Object>} - A promise that resolves to an object containing the status, message, and saved rule data.
     */
    save: async (id, rule, maxDailyUsageTime, isActive) => {
        const rulesStore = new RulesStore(
            new LocalDatabase()
        );

        try {
            let existingRule = undefined;
            if (id && id !== "") {
                existingRule = await rulesStore.findById(id);
                await rulesStore.update(existingRule.id, rule, maxDailyUsageTime, isActive);

                return {
                    status: "1",
                    message: "Sucess!",
                    data: existingRule
                };
            }

            existingRule = await rulesStore.findByRule(rule);
            if (existingRule) {
                return {
                    status: "0",
                    message: `Rule already exists`,
                };
            }

            await rulesStore.insert(rule, maxDailyUsageTime, isActive);
            existingRule = await rulesStore.findByRule(rule);

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
     * Retrieves all rules from the RulesStore.
     * 
     * @returns {Promise<Array>} - A promise that resolves to an array of all rules.
     */
    list: async (filters = {}) => {
        const rulesStore = new RulesStore(
            new LocalDatabase()
        );

        return await rulesStore.select(filters);
    },
    /**
    * Deletes a rule from the RulesStore by its ID.
    * 
    * @param {string} id - The ID of the rule to be deleted.
    * @returns {Promise<Object>} - A promise that resolves to an object containing the status and message of the delete operation.
    */
    delete: async (id) => {
        const rulesStore = new RulesStore(
            new LocalDatabase()
        );

        try {
            await rulesStore.delete(id);
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
    },
    /**
     * Atualiza vários rules de uma vez.
     * @param {Array<Object>} rules - Array de objetos rule com id e campos a atualizar.
     * @returns {Promise<Object>} - Status e mensagem.
     */
    updateMany: async (rules) => {
        const rulesStore = new RulesStore(
            new LocalDatabase()
        );
        try {
            for (const rule of rules) {
                await rulesStore.update(rule.id, rule.rule, rule.maxDailyUsageTimeSeconds, rule.isActive, rule.order);
            }
            return {
                status: "1",
                message: "Regras atualizadas com sucesso!"
            };
        } catch (error) {
            return {
                status: "0",
                message: `Falha ao atualizar regras: ${error.message}`,
            };
        }
    },
};