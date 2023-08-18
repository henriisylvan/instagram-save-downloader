const { JsonHandler } = require('../utils');

const getNextDownloadNumber = downloadRoot => {
    const allDownloads = downloadRoot.read();
    if (!allDownloads.length) return 1;

    const lastDownloadNumber = Number(allDownloads.pop().replace(/[^0-9]/g, ''));
    return lastDownloadNumber + 1;
};

const generateDownloadDir = downloadRoot => {
    const downloadNumber = getNextDownloadNumber(downloadRoot);
    const strDownloadNumber = downloadNumber.toString().padStart(4, 0);

    return downloadRoot.createSubDir(`download_${strDownloadNumber}`);
};

const generateDownloadInfo = (downloadPath, log, additionalValues = {}) => {
    const infoData = {
        log: log.file,
        user: log.obj.user,
        date: new Date(),
        ...additionalValues,
        media: {
            success: [],
            error: [],
            skip: []
        }
    };

    const downloadInfo = new JsonHandler(`${downloadPath}/info.json`, infoData, true);

    downloadInfo.save();

    return downloadInfo;
};

const generateTempFile = (dir, file) => dir.saveFile(file, 'no delete');

const deleteTempFile = (dir, file) => dir.saveFile(file, '').delete();

module.exports = {
    generateDownloadDir,
    generateDownloadInfo,
    generateTempFile,
    deleteTempFile
};