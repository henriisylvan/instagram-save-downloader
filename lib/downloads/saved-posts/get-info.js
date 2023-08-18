const CONSTANTS = require('../../../settings/constants.json');

const { JsonHandler, DirHandler } = require('../../utils');

const SAVED_POSTS_DOWNLOADS_PATH = CONSTANTS.paths.saved_posts_downloads;

const downloadRootDirHandler = new DirHandler(SAVED_POSTS_DOWNLOADS_PATH);

const getAllDownloadDirsHandler = () => downloadRootDirHandler.read().map(dir => downloadRootDirHandler.createSubDir(dir));

const existsSomeFailedSavedPostsMedia = () => getAllDownloadDirsHandler().some(handler => handler.read().includes('.temp-error'));

const existsSomeSkipedSavedPostsMedia = () => getAllDownloadDirsHandler().some(handler => handler.read().includes('.temp-skip'));

const getAllFailedMediaDirs = () => getAllDownloadDirsHandler().filter(handler => handler.read().includes('.temp-error'));

const getAllSkipedMediaDirs = () => getAllDownloadDirsHandler().filter(handler => handler.read().includes('.temp-skip'));

const getCollectionsHandlers = dir => dir.read().reduce((obj, subdir) => !subdir.includes('.') ? ({ ...obj, [subdir]: dir.createSubDir(subdir) }) : obj, {});

const getInfoFile = dir => new JsonHandler(`${dir.path}/info.json`);

module.exports = {
    existsSomeFailedSavedPostsMedia,
    existsSomeSkipedSavedPostsMedia,
    getAllFailedMediaDirs,
    getAllSkipedMediaDirs,
    getCollectionsHandlers,
    getInfoFile
};