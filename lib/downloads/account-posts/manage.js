const interface = require('../../interface/interfaces');

const { createAccountPostsDownloadDirStructure } = require('./dir-manage');
const { generateAllMediaPostsObjects } = require('./data-manage');
const { generateTempFile, deleteTempFile } = require('../download-dir');
const { downloadMediaLoop } = require('../download');
const { getAllSkippedMediaDirs, getInfoFile, getAllFailedMediaDirs } = require('./get-info');

const controlOfDownloadAccountsPostsLog = async log => {
    const downloadStructure = createAccountPostsDownloadDirStructure(log);

    const {
        dir: downloadDirHandler,
        info: downloadInfo,
        postsDir
    } = downloadStructure;

    const allMediaObjects = generateAllMediaPostsObjects(log, postsDir);

    const asyncDownload = await interface.askAsyncDownload();
    const allMediaResult = await downloadMediaLoop(allMediaObjects, postsDir, asyncDownload);

    for (const mediaResult of allMediaResult) downloadInfo.obj.media[mediaResult.status].push(mediaResult);

    downloadInfo.save();

    if (downloadInfo.obj.media.skip.length) generateTempFile(downloadDirHandler, '.temp-skip');
    if (downloadInfo.obj.media.error.length) generateTempFile(downloadDirHandler, '.temp-error');

    interface.downloadResultLog(downloadStructure, allMediaResult);
};

const controlOfTryFailedAccountPostsMediaAgain = async () => {
    const allFailedMediaDirsHandlers = getAllFailedMediaDirs();
    const selectedDirHandler = await interface.selectDownloadDir(allFailedMediaDirsHandlers);

    const downloadInfo = getInfoFile(selectedDirHandler);
    const postsDir = { default: selectedDirHandler.createSubDir('__all_posts__') }

    const asyncDownload = await interface.askAsyncDownload();
    const allMediaResult = await downloadMediaLoop(downloadInfo.obj.media.error, postsDir, asyncDownload, false);

    downloadInfo.obj.media.error = [];

    for (const mediaResult of allMediaResult)
        if (mediaResult.status == 'success') {
            downloadInfo.obj.media.success.splice(mediaResult.index, 0, mediaResult);
        } else {
            downloadInfo.obj.media.error.push(mediaResult);
        };
        
    downloadInfo.save();

    if (!downloadInfo.obj.media.error.length) deleteTempFile(selectedDirHandler, '.temp-error');
    
    interface.downloadResultLog({ dir: selectedDirHandler, info: downloadInfo }, allMediaResult);
};

const controlOfContinueAccountPostsDownload = async () => {
    const allSkippedMediaDirsHandlers = getAllSkippedMediaDirs();
    const selectedDirHandler = await interface.selectDownloadDir(allSkippedMediaDirsHandlers);

    const downloadInfo = getInfoFile(selectedDirHandler);
    const postsDir = { default: selectedDirHandler.createSubDir('__all_posts__') }

    const asyncDownload = await interface.askAsyncDownload();
    const allMediaResult = await downloadMediaLoop(downloadInfo.obj.media.skip, postsDir, asyncDownload);

    downloadInfo.obj.media.skip = [];

    for (const mediaResult of allMediaResult)
        if (mediaResult.status == 'success') {
            downloadInfo.obj.media.success.splice(mediaResult.index, 0, mediaResult);
        } else {
            downloadInfo.obj.media[mediaResult.status].push(mediaResult);
        };
        
    downloadInfo.save();

    if (!downloadInfo.obj.media.skip.length) deleteTempFile(selectedDirHandler, '.temp-skip');
    if (downloadInfo.obj.media.error.length) generateTempFile(selectedDirHandler, '.temp-error');

    interface.downloadResultLog({ dir: selectedDirHandler, info: downloadInfo }, allMediaResult);
};

module.exports = {
    controlOfDownloadAccountsPostsLog,
    controlOfTryFailedAccountPostsMediaAgain,
    controlOfContinueAccountPostsDownload
};