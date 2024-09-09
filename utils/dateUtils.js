const DateUtils = {
    convertLocalDateToUTCIgnoringTimezone: (date) => {
        const timestamp = Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            date.getUTCMilliseconds()
        );
      
        return new Date(timestamp);
    },
    convertUTCToLocalDateIgnoringTimezone: (utcDate) => {
        return new Date(
            utcDate.getFullYear(),
            utcDate.getMonth(),
            utcDate.getDate(),
            utcDate.getHours(),
            utcDate.getMinutes(),
            utcDate.getSeconds(),
            utcDate.getMilliseconds()
        );
    },
    getInitialAndFinalDate(date){
        const initial = new Date(date);
        initial.setHours(0);
        initial.setMinutes(0);
        initial.setSeconds(0);

        const final = new Date(date);
        final.setHours(23);
        final.setMinutes(59);
        final.setSeconds(59);

        return {
            initial: initial,
            final: final
        }
    }
};