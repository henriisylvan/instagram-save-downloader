const CONSTANTS = require('../../../settings/constants.json');

const { DirHandler } = require('../../utils');

const SINGLE_POSTS_DOWNLOADS_PATH = CONSTANTS.paths.single_posts_downloads;
const POST_URL_REGEXP = /^(?:https?:\/\/)?(?:www\.)?instagram\.com(?:\/[a-z\d\-_]{1,255})?\/p\/([\w\-]{11})\/?/;

const downloadRootDirHandler = new DirHandler(SINGLE_POSTS_DOWNLOADS_PATH);

const testPostUrl = url => POST_URL_REGEXP.test(url);

const getPostUrlCode = url => POST_URL_REGEXP.exec(url)[1];

const existDirDownload = dir => downloadRootDirHandler.read().includes(dir);

module.exports = {
    downloadRootDirHandler,
    testPostUrl,
    getPostUrlCode,
    existDirDownload
};