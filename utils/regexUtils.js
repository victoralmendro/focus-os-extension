const RegexUtils = {
    escapeStringForRegex: (string)=>{
        string = String(string);

        var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
    
        return (string && reHasRegExpChar.test(string))
        ? string.replace(reRegExpChar, '\\$&')
        : string;
    },
    unscapeStringForRegex: (string) => {
        return String(string).replace(/\\([\\^$.*+?()[\]{}|])/g, '$1');
    }
}