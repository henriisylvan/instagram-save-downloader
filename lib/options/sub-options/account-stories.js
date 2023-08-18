const optionsRunner = require('../options-runner');

const { colorStr } = require('../../interface/interface-tools/colors');
const { controlOfDownloadAccountStories } = require('../../downloads/account-stories/manage');

const OPTIONS = [
    {
        value: 'Download account stories',
        description: 'Will download the stories of an account',
        execution: controlOfDownloadAccountStories
    },

    { value: colorStr('Return', 'red') }
];

module.exports = {
    index: 3,
    value: 'Account stories options',
    available: () => OPTIONS.filter(option => option.available?.() ?? true).length > 1,
    execution: () => optionsRunner(OPTIONS)
};