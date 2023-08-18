const request = require('request-promise').defaults({ encoding: null, timeout: 150000 });

const { sleep } = require('../utils');

const ProgressBar = require('../interface/interface-tools/progress-bar');

const SAFETY_LIMIT_ASYNC = 10000;

const downloadMediaProgress = new ProgressBar('Downloading media', 'Medias');

const downloadMediaLoop = async (mediaObjects, handlersObj, asyncDownload = true, useSafetyLimit = true) => {
    const amountOfMedia = mediaObjects.length;
    const safetyLimit = asyncDownload && useSafetyLimit ? Math.min(amountOfMedia, SAFETY_LIMIT_ASYNC) : amountOfMedia;

    const allDownloadedMedia = [];

    downloadMediaProgress.start(amountOfMedia);
    
    for (let index = 0; index < safetyLimit; index++) {
        const dirHandler = handlersObj[mediaObjects[index].collection?.name || 'default'];

        const downloadPromise = asyncDownload ? downloadMedia(mediaObjects[index], dirHandler) : await downloadMedia(mediaObjects[index], dirHandler);
        allDownloadedMedia.push(downloadPromise);
        
        if (asyncDownload) {
            downloadPromise.then(() => downloadMediaProgress.increment());
            await sleep(200);
        } else {
            downloadMediaProgress.increment();
        };
    };

    const result = await Promise.allSettled(allDownloadedMedia);
    
    downloadMediaProgress.stop();

    const downloaded = result.map((obj) => obj.value);
    const skipped = mediaObjects.slice(downloaded.length);
    
    return downloaded.concat(...skipped);
};
    
const downloadMedia = async (mediaObj, dirHandler) => {
    try {
        const response = await request.get(mediaObj.media.url);

        dirHandler.saveFile(mediaObj.media.file, response);

        delete mediaObj.error;
        mediaObj.status = 'success';
    } catch (err) {
        mediaObj.status = 'error';
        mediaObj.error = (err.statusCode === 403) ? 403 : 408;
    };

    return mediaObj;
};

module.exports = {
    downloadMediaLoop
};