const optionsRunner = require('../options-runner');

const { colorStr } = require('../../interface/interface-tools/colors');
const { controlOfDownloadSingleMedia } = require('../../downloads/single-posts/manage');

const OPTIONS = [
    {
        value: 'Download some post',
        description: 'Will download a post by the URL',
        execution: controlOfDownloadSingleMedia
    },

    { value: colorStr('Return', 'red') }
];

module.exports = {
    index: 1,
    value: 'Single posts options',
    available: () => OPTIONS.filter(option => option.available?.() ?? true).length > 1,
    execution: () => optionsRunner(OPTIONS)
};