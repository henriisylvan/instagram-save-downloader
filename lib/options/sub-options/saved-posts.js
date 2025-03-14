const logManage = require('../../logs/saved-posts/manage');
const logsInfo = require('../../logs/saved-posts/get-info');
const downloadsInfo = require('../../downloads/saved-posts/get-info');
const downloadManage = require('../../downloads/saved-posts/manage');

const optionsRunner = require('../options-runner');

const { colorStr } = require('../../interface/interface-tools/colors');

const OPTIONS = [
    {
        value: 'Generate log of saved posts',
        description: 'Will take information from posts saved in your account to download them later',
        execution: logManage.generateSavedPostsLog
    },
    {
        value: 'Generate log of remaining saved posts',
        description: 'Will take information from remaining posts saved in your account to download them later',
        available: logsInfo.existsSomeSavedPostsLog,
        execution: () => logManage.generateSavedPostsLog(true)
    },

    {
        value: 'Download saved posts',
        description: 'Will download the media obtained from a log of saved posts',
        available: logsInfo.existsSomeSavedPostsLog,
        execution: logManage.selectSavedPostsLogForDownload
    },
    {
        value: 'Continue a download of saved posts',
        description: 'Will continue downloading previously interrupted media for security reasons',
        available: downloadsInfo.existsSomeSkippedSavedPostsMedia,
        execution: downloadManage.controlOfContinueSavedPostsDownload
    },
    {
        value: 'Try failed media of saved posts again',
        description: 'Will attempt to download media failed in a previous download',
        available: downloadsInfo.existsSomeFailedSavedPostsMedia,
        execution: downloadManage.controlOfTryFailedSavedPostsMediaAgain
    },

    { value: colorStr('Return', 'red') }
];

module.exports = {
    index: 4,
    value: 'Saved posts options',
    available: () => OPTIONS.filter(option => option.available?.() ?? true).length > 1,
    execution: () => optionsRunner(OPTIONS)
};