const fs = require('fs');

const SUB_OPTIONS_PATH = './lib/options/sub-options/';

const getSubOptions = () => fs.readdirSync(SUB_OPTIONS_PATH).map(file => require('./sub-options/' + file)).sort((a, b) => a.index - b.index);

module.exports = getSubOptions;