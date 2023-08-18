const interface = require('../../interface/interfaces');
const instagramRequests = require('../../instagram-manage/content-request');
const fetchAccountStories = require('../../posts-handlers/account-stories/fetch');

const { getAccountNameUrl } = require('./get-info');
const { generateStoriesDirStructure, generateStoriesMediaObjects } = require('./data-manage');
const { downloadMediaLoop } = require('../download');

const controlOfDownloadAccountStories = async () => {
    try {
        const accountUrl = await interface.getAccountNameInput();
        const accountName = getAccountNameUrl(accountUrl);
        const accountId = await instagramRequests.getUserId(accountName);
    
        const storiesFeed = instagramRequests.getUserStoriesFeed(accountId);

        const data = await fetchAccountStories(storiesFeed, accountName);

        if (!data.length) 
            return console.log(colorStr(` >>> There are no stories on this account`, 'red'));
            
        const dirStructure = generateStoriesDirStructure({ 
            id: accountId, name: accountName, url: accountUrl
        });

        const mediaObjects = generateStoriesMediaObjects(data);
        const mediaResult = await downloadMediaLoop(mediaObjects, { default: dirStructure.dir }, true);

        for (const result of mediaResult) dirStructure.info.obj.media[result.status].push(result);

        dirStructure.info.save();

        interface.downloadResultLog(dirStructure, mediaResult, false);
    } catch (err) {
        if (err.name == 'IgExactUserNotFoundError')
            return console.log(colorStr(` >>> This account does not exist`, 'red'));
        
        throw err;    
    };
};

module.exports = {
    controlOfDownloadAccountStories
};