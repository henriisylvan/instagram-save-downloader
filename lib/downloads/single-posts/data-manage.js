const { JsonHandler } = require('../../utils');
const { getCredentials } = require('../../credentials-handler');
const { downloadRootDirHandler } = require('./get-info');

const getFileExtention = media => media.type === 'image' && media.extension !== 'gif' ? 'jpg' : media.extension;

const generateSingleMediaObjects = medias => medias.map((media, index) => ({
    status: '',
    media: {
        ...media,
        index,
        file: `media_${(index + 1).toString().padStart(2, 0)}.${getFileExtention(media)}`
    }
}));

const generateSingleMediaInfo = (code, data, dir) => {
    const infoData = {
        user: getCredentials().username,
        date: new Date(),
        code,
        url: data.url,
        id: data.pk,
        caption: data.caption,
        media: {
            success: [],
            error: []
        }
    };

    const singleMediaInfo = new JsonHandler(`${dir.path}/info.json`, infoData, true);

    singleMediaInfo.save();

    return singleMediaInfo;
};

const generateSingleMediaDirStructure = (code, data) => {
    const singleMediaDir = downloadRootDirHandler.createSubDir(code);

    const singleMediaInfo = generateSingleMediaInfo(code, data, singleMediaDir);
    
    const downloadData = {
        dir: singleMediaDir,
        info: singleMediaInfo,
    };

    return downloadData;
};

module.exports = {
    generateSingleMediaDirStructure,
    generateSingleMediaObjects
};