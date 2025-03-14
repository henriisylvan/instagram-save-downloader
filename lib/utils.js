const fs = require('fs');

class JsonHandler {
    constructor (path, value = null, forceOverwriting = false) {
        this.path = path;
        this.file = path.split('/').pop();
        this.obj = fs.existsSync(path) && !forceOverwriting ? JSON.parse(fs.readFileSync(path)) : value;
    };

    save() {
        fs.writeFileSync(this.path, JSON.stringify(this.obj, null, 4));
    };

    delete() {
        if (fs.existsSync(this.path)) fs.unlinkSync(this.path);
    };
};

class DirHandler {
    constructor (path) {
        if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });

        this.path = path;
        this.dir = path.split('/').filter(Boolean).pop();
    };

    read () {
        return fs.readdirSync(this.path);
    };

    saveFile (fileName, data) {
        fs.writeFileSync(`${this.path}/${fileName}`, data);

        return {
            path: `${this.path}/${fileName}`,
            file: fileName,
            data,
            delete: () => fs.existsSync(`${this.path}/${fileName}`) && fs.unlinkSync(`${this.path}/${fileName}`)
        };
    };

    createSubDir (subDirName) {
        return new DirHandler(`${this.path}/${subDirName}`);
    };
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getOrdinal = number => {
    const suffix = [ "th", "st", "nd", "rd" ];
    const value = number % 100;
    return number + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
};

const folderNameValid = name => /^[^\\\/\?\%\*\:\|"<>\.]+$/.test(name);

const removeRepeatedValues = array => [ ...new Set(array) ];

const range = (start, size = start) => [ ...Array(size).keys() ].filter(size > start ? (num => num >= start) : (() => true));

const convertMsToTimeFormat = ms => {
    const milliseconds = Math.floor(ms);
    
    const timeArr = range(4).reverse().map(key => Math.floor(milliseconds / (!key || ((60 ** (key - 1)) * 1000))) % ((!key * 1000) || (key == 3 ? Infinity : 60)));
    const timeStrArr = timeArr.map((num, index, arr) =>  num.toString().padStart((index == arr.length - 1) ? 3 : 2, 0));

    const timeFormat = timeStrArr.join(':').replace(/:(?=\d{3})/, '.');

    return timeFormat;
};

const convertSecondsToTimeFormat = seconds => {
    const indexes = range(3).reverse();
    
    const timeArr = indexes.map(index => Math.floor(seconds / 60 ** index) % (index == 2 ? Infinity : 60));
    const timeStrArr = timeArr.map(num => num.toString().padStart(2, 0));

    return timeStrArr.join(':');
};

const padBoth = (str, maxLength, prefix, suffix = prefix) => {
    if (str.length >= maxLength) return str;

    const lengthSplitted = (maxLength - str.length) / 2;

    const prefixStr = prefix.repeat(Math.floor(lengthSplitted));
    const suffixStr = suffix.repeat(Math.ceil(lengthSplitted));

    return prefixStr + str + suffixStr;
};

module.exports = {
    JsonHandler,
    DirHandler,
    sleep,
    getOrdinal,
    folderNameValid,
    removeRepeatedValues,
    range,
    convertMsToTimeFormat,
    convertSecondsToTimeFormat,
    padBoth
};
 