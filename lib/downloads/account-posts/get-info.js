const CONSTANTS = require('../../../settings/constants.json');

const { JsonHandler, DirHandler } = require('../../utils');

const ACCOUNT_POSTS_DOWNLOADS_PATH = CONSTANTS.paths.account_posts_downloads;

const downloadRootDirHandler = new DirHandler(ACCOUNT_POSTS_DOWNLOADS_PATH);

const getAllDownloadDirsHandler = () => downloadRootDirHandler.read().map(dir => downloadRootDirHandler.createSubDir(dir));

const existsSomeFailedAccountPostsMedia = () => getAllDownloadDirsHandler().some(handler => handler.read().includes('.temp-error'));

const existsSomeSkipedAccountPostsMedia = () => getAllDownloadDirsHandler().some(handler => handler.read().includes('.temp-skip'));

const getAllSkipedMediaDirs = () => getAllDownloadDirsHandler().filter(handler => handler.read().includes('.temp-skip'));

const getAllFailedMediaDirs = () => getAllDownloadDirsHandler().filter(handler => handler.read().includes('.temp-error'));

const getInfoFile = dir => new JsonHandler(`${dir.path}/info.json`);

module.exports = {
    existsSomeFailedAccountPostsMedia,
    existsSomeSkipedAccountPostsMedia,
    getAllFailedMediaDirs,
    getAllSkipedMediaDirs,
    getInfoFile
};