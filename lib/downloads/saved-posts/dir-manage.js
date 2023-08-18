const CONSTANTS = require('../../../settings/constants.json');

const { DirHandler } = require('../../utils');
const { generateDownloadDir, generateDownloadInfo } = require('../download-dir');

const SAVED_POSTS_DOWNLOADS_PATH = CONSTANTS.paths.saved_posts_downloads;

const generateDownloadCollectionsDir = (downloadDir, collections) => 
    collections.reduce((obj, name) => {
        obj[name] = downloadDir.createSubDir(name);
        return obj;
    }, {});

const createSavedPostsDownloadDirStructure = (log) => {
    const downloadsDir = new DirHandler(SAVED_POSTS_DOWNLOADS_PATH);
    const newDownloadDir = generateDownloadDir(downloadsDir);

    const dowloadInfo = generateDownloadInfo(newDownloadDir.path, log);

    const allCollectionNames = log.obj.data.map(obj => obj.collection);
    const collectionsDirs = generateDownloadCollectionsDir(newDownloadDir, allCollectionNames);

    const downloadData = {
        dir: newDownloadDir,
        info: dowloadInfo,
        collections: collectionsDirs,
    };

    return downloadData;
};

module.exports = {
    createSavedPostsDownloadDirStructure
};