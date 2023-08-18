const logManage = require('../../logs/account-posts/manage');
const logsInfo = require('../../logs/account-posts/get-info');
const downloadsInfo = require('../../downloads/account-posts/get-info');
const downloadManage = require('../../downloads/account-posts/manage');

const optionsRunner = require('../options-runner');

const { colorStr } = require('../../interface/interface-tools/colors');

const OPTIONS = [
    {
        value: 'Generate log of posts from an account',
        description: 'Will take information of posts from an account to download them later',
        execution: logManage.generateAccountPostsLog
    },
    {
        value: 'Generate log of remaining posts from an account',
        description: 'Will take information of remaining posts from an account to download them later',
        available: logsInfo.existsSomeAccountPostsLog,
        execution: () => logManage.generateAccountPostsLog(true)
    },

    {
        value: 'Download account posts',
        description: 'Will download media obtained from a log of account\'s posts',
        available: logsInfo.existsSomeAccountPostsLog,
        execution: logManage.selectAccountPostsLogForDownload
    },
    {
        value: 'Continue a download of account posts',
        description: 'Will continue downloading previously interrupted media for security reasons',
        available: downloadsInfo.existsSomeSkipedAccountPostsMedia,
        execution: downloadManage.controlOfContinueAccountPostsDownload
    },
    {
        value: 'Try failed media of account posts again',
        description: 'Will attempt to download media failed in a previous download',
        available: downloadsInfo.existsSomeFailedAccountPostsMedia,
        execution: downloadManage.controlOfTryFailedAccountPostsMediaAgain
    },

    { value: colorStr('Return', 'red') }
];

module.exports = {
    index: 2,
    value: 'Account posts options',
    available: () => OPTIONS.filter(option => option.available?.() ?? true).length > 1,
    execution: () => optionsRunner(OPTIONS)
};