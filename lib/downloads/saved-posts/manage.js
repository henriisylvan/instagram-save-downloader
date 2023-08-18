const interface = require('../../interface/interfaces');

const { createSavedPostsDownloadDirStructure } = require('./dir-manage');
const { generateTempFile, deleteTempFile } = require('../download-dir');
const { generateAllMediaPostsObjects } = require('./data-manage');
const { downloadMediaLoop } = require('../download');
const { getAllFailedMediaDirs, getAllSkipedMediaDirs, getCollectionsHandlers, getInfoFile } = require('./get-info');

const controlOfDownloadSavedPostsLog = async log => {
    if (log.obj.data.length > 1) log.obj.data.shift();

    const downloadStructure = createSavedPostsDownloadDirStructure(log);

    const {
        dir: downloadDirHandler,
        info: downloadInfo,
        collections: collectionsDirs
    } = downloadStructure;
    
    const allMediaObjects = generateAllMediaPostsObjects(log, collectionsDirs);
    
    const asyncDownload = await interface.askAsyncDownload();
    const allMediaResult = await downloadMediaLoop(allMediaObjects, collectionsDirs, asyncDownload);

    for (const mediaResult of allMediaResult) downloadInfo.obj.media[mediaResult.status].push(mediaResult);

    downloadInfo.save();

    if (downloadInfo.obj.media.skip.length) generateTempFile(downloadDirHandler, '.temp-skip');
    if (downloadInfo.obj.media.error.length) generateTempFile(downloadDirHandler, '.temp-error');

    interface.downloadResultLog(downloadStructure, allMediaResult);
};

const controlOfTryFailedSavedPostsMediaAgain = async () => {
    const allFailedMediaDirsHandlers = getAllFailedMediaDirs();
    const selectedDirHandler = await interface.selectDownloadDir(allFailedMediaDirsHandlers);

    const downloadInfo = getInfoFile(selectedDirHandler);
    const collectionsDirs = getCollectionsHandlers(selectedDirHandler);

    const asyncDownload = await interface.askAsyncDownload();
    const allMediaResult = await downloadMediaLoop(downloadInfo.obj.media.error, collectionsDirs, asyncDownload, false);

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

const controlOfContinueSavedPostsDownload = async () => {
    const allSkipedMediaDirsHandlers = getAllSkipedMediaDirs();
    const selectedDirHandler = await interface.selectDownloadDir(allSkipedMediaDirsHandlers);

    const downloadInfo = getInfoFile(selectedDirHandler);
    const collectionsDirs = getCollectionsHandlers(selectedDirHandler);

    const asyncDownload = await interface.askAsyncDownload();
    const allMediaResult = await downloadMediaLoop(downloadInfo.obj.media.skip, collectionsDirs, asyncDownload);

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
    controlOfDownloadSavedPostsLog,
    controlOfTryFailedSavedPostsMediaAgain,
    controlOfContinueSavedPostsDownload
};