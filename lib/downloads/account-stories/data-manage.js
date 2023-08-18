const { JsonHandler } = require('../../utils');
const { getCredentials } = require('../../credentials-handler');
const { downloadRootDirHandler } = require('./get-info');

const getFileExtention = media => media.type === 'image' && media.extension !== 'gif' ? 'jpg' : media.extension;

const generateStoriesMediaObjects = medias => medias.map(({ media, ...rest }, index) => ({
    status: '',
    ...rest,
    media: {
        ...media[0],
        index,
        file: `media_${(index + 1).toString().padStart(2, 0)}.${getFileExtention(media[0])}`
    }
}));

const generateStoriesSubDir = (accountId, date) => {
    const accountDir = downloadRootDirHandler.createSubDir(accountId);

    const dateFormat = date.toLocaleDateString('en-GB', { 
        year: 'numeric', month: '2-digit',  day: '2-digit'
    }).split('/').reverse().join('-');

    const timeFormat = date.toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h24'
    }).replace(/:/g, '-');

    const storiesDirName = `${dateFormat}_${timeFormat}`;

    return accountDir.createSubDir(storiesDirName);
};

const generateStoriesMediaInfo = (account, date, dir) => {
    const infoData = {
        user: getCredentials().username,
        date,
        account,
        media: {
            success: [],
            error: []
        }
    };

    const storiesMediaInfo = new JsonHandler(`${dir.path}/info.json`, infoData, true);

    storiesMediaInfo.save();

    return storiesMediaInfo;
};

const generateStoriesDirStructure = accountInfo => {
    const date = new Date();

    const storiesMediaDir = generateStoriesSubDir(accountInfo.id, date);

    const storiesMediaInfo = generateStoriesMediaInfo(accountInfo, date, storiesMediaDir);
    
    const downloadData = {
        dir: storiesMediaDir,
        info: storiesMediaInfo,
    };

    return downloadData;
};

module.exports = {
    generateStoriesMediaObjects,
    generateStoriesDirStructure
};