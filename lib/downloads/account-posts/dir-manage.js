const CONSTANTS = require('../../../settings/constants.json');

const { DirHandler } = require('../../utils');
const { generateDownloadDir, generateDownloadInfo } = require('../download-dir');

const ACCOUNT_POSTS_DOWNLOADS_PATH = CONSTANTS.paths.account_posts_downloads;

const createAccountPostsDownloadDirStructure = log => {
    const downloadDirRoot = new DirHandler(ACCOUNT_POSTS_DOWNLOADS_PATH);
    const newDownloadDir = generateDownloadDir(downloadDirRoot);

    const downloadInfo = generateDownloadInfo(newDownloadDir.path, log, { account: log.obj.account });
    
    const postsDir = { default: newDownloadDir.createSubDir('__all_posts__') };

    const downloadData = {
        dir: newDownloadDir,
        info: downloadInfo,
        postsDir,
    };

    return downloadData;
};

module.exports = {
    createAccountPostsDownloadDirStructure
};