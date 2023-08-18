const chalk = require('chalk');

const colorStr = (text, color = 'white', style = 'reset') => chalk[style][color](text);

const multiColorStrs = (texts, colors = [], styles = []) => texts.reduce((acc, str, index) => acc + colorStr(str, colors[index], styles[index]), '');

module.exports = {
    colorStr,
    multiColorStrs
};