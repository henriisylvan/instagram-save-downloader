const request = require('request-promise').defaults({ encoding: null, timeout: 150000 });

const CONSTANTS = require('../../../settings/constants.json');

const { JsonHandler, DirHandler } = require('../../utils');

const SAVED_POSTS_LOGS_PATH = CONSTANTS.paths.saved_posts_logs;

const logRootDirHandler = new DirHandler(SAVED_POSTS_LOGS_PATH);

const getNextLogNumber = () => {
    const allLogs = logRootDirHandler.read();
    if (!allLogs.length) return 1;

    const lastLogNumber = Number(allLogs.pop().replace(/[^0-9]/g, ''));
    return lastLogNumber + 1;
};

const getAllSavedPostsLogs = () => logRootDirHandler.read().map(file => new JsonHandler(`${SAVED_POSTS_LOGS_PATH}/${file}`));

const getAllSavedPostsLogsFileNames = () => logRootDirHandler.read();

const getSavedPostsLog = logName => new JsonHandler(`${SAVED_POSTS_LOGS_PATH}/${logName}`);

const existsSomeSavedPostsLog = () => !!logRootDirHandler.read().length;

const checkSafeSavedPostsUrls = async log => {
    const allPosts = log.obj.data[0].posts;

    const urlsTest = await request.get(allPosts[0].media[0].url).catch(err => err.statusCode);

    return urlsTest !== 403; 
};

module.exports = {
    logRootDirHandler,
    getNextLogNumber,
    getAllSavedPostsLogs,
    getAllSavedPostsLogsFileNames,
    getSavedPostsLog,
    existsSomeSavedPostsLog,
    checkSafeSavedPostsUrls
};