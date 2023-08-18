const request = require('request-promise').defaults({ encoding: null, timeout: 150000 });

const CONSTANTS = require('../../../settings/constants.json');

const { JsonHandler, DirHandler } = require('../../utils');

const ACCOUNT_POSTS_LOGS_PATH = CONSTANTS.paths.account_posts_logs;
const ACCOUNT_URL_REGEX = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([\w](?!.*?\.{2})[\w\.]{1,28}[\w])/;

const logRootDirHandler = new DirHandler(ACCOUNT_POSTS_LOGS_PATH);

const getNextLogNumber = () => {
    const allLogs = logRootDirHandler.read();
    if (!allLogs.length) return 1;

    const lastLogNumber = Number(allLogs.pop().replace(/[^0-9]/g, ''));
    return lastLogNumber + 1;
};

const testAccountUrl = url => ACCOUNT_URL_REGEX.test(url);

const getAccountNameUrl = url => ACCOUNT_URL_REGEX.exec(url)[1];

const getAccountLogsByAccount = account => logRootDirHandler.read().map(file => new JsonHandler(`${ACCOUNT_POSTS_LOGS_PATH}/${file}`)).filter(log => log.obj.account.name == account);

const getAllAccountPostsLogsFileNames = () => logRootDirHandler.read();

const getAccountPostsLog = logName => new JsonHandler(`${ACCOUNT_POSTS_LOGS_PATH}/${logName}`);

const existsSomeAccountPostsLog = () => !!logRootDirHandler.read().length;

const checkSafeAccountPostsUrls = async log => {
    const allPosts = log.obj.posts;

    const urlsTest = await request.get(allPosts[0].media[0].url).catch(err => err.statusCode);

    return urlsTest !== 403; 
};

module.exports = {
    logRootDirHandler,
    getNextLogNumber,
    testAccountUrl,
    getAccountNameUrl,
    getAccountLogsByAccount,
    existsSomeAccountPostsLog,
    getAllAccountPostsLogsFileNames,
    getAccountPostsLog,
    checkSafeAccountPostsUrls
};