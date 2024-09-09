const TimeTableService = {
    getDateUsageByRule: async (ruleId, initialDate, finalDate)=>{
        const store = new TimeTableStore(
            new LocalDatabase()
        );

        return await store.select({
            ruleId: ruleId,
            initialDateUtc: DateUtils.convertLocalDateToUTCIgnoringTimezone(initialDate),
            finalDateUtc: DateUtils.convertLocalDateToUTCIgnoringTimezone(finalDate)
        });
    }
};