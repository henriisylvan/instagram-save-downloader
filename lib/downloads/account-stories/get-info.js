const CONSTANTS = require('../../../settings/constants.json');

const { DirHandler } = require('../../utils');

const ACCOUNT_STORIES_DOWNLOADS_PATH = CONSTANTS.paths.account_stories_downloads;
const ACCOUNT_URL_REGEX = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([\w](?!.*?\.{2})[\w\.]{1,28}[\w])/;

const downloadRootDirHandler = new DirHandler(ACCOUNT_STORIES_DOWNLOADS_PATH);

const getAccountNameUrl = url => ACCOUNT_URL_REGEX.exec(url)[1];

module.exports = {
    downloadRootDirHandler,
    getAccountNameUrl
};