const TimeUtils = {
    /**
     * Formats a duration given in seconds into a human-readable string
     * representing hours, minutes, or seconds.
     *
     * @param {number} seconds - The duration in seconds.
     * @returns {string} - A string representing the duration in the largest unit possible.
     *                     - For example: "2h", "45m", or "30s".
     */
    formatTime: (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${seconds}s`;
        }
    },

    /**
     * Converts a time duration given in hours, minutes, and seconds into total seconds.
     *
     * @param {number} [hours=0] - The number of hours (optional, default is 0).
     * @param {number} [minutes=0] - The number of minutes (optional, default is 0).
     * @param {number} [seconds=0] - The number of seconds (optional, default is 0).
     * @returns {number} - The total time in seconds.
     */
    timeToSeconds: (hours = 0, minutes = 0, seconds = 0) => {
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        seconds = parseInt(seconds);

        const hoursInSeconds = hours * 3600;
        
        const minutesInSeconds = minutes * 60;
        
        const totalSeconds = hoursInSeconds + minutesInSeconds + seconds;
        
        return totalSeconds;
    },

    /**
     * Converts a total number of seconds into an object containing hours, minutes, and seconds.
     *
     * @param {number} totalSeconds - The total time in seconds.
     * @returns {Object} - An object with the properties:
     *                      - `hours` {number}: The number of hours.
     *                      - `minutes` {number}: The number of minutes.
     *                      - `seconds` {number}: The remaining seconds.
     */
    secondsToTime: (totalSeconds) => {

        totalSeconds = parseInt(totalSeconds);

        if(isNaN(totalSeconds)){
            return {
                hours: 0,
                minutes: 0,
                seconds: 0
            }
        }

        const hours = Math.floor(totalSeconds / 3600);
        
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        const seconds = totalSeconds % 60;
        
        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
    }
};
