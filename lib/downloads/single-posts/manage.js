const { urlSegmentToInstagramId } = require('instagram-id-to-url-segment');

const interface = require('../../interface/interfaces');

const { getPostInfoById } = require('../../instagram-manage/content-request.js');
const { downloadRootDirHandler, getPostUrlCode, existDirDownload } = require('./get-info');
const { colorStr } = require('../../interface/interface-tools/colors.js');
const { filterMediaInfo } = require('../../posts-handlers/items-filter');
const { generateSingleMediaDirStructure, generateSingleMediaObjects } = require('./data-manage');
const { downloadMediaLoop } = require('../download');

const controlOfDownloadSingleMedia = async () => {
    const urlInput = await interface.getPostUrlInput();
    const urlCode = getPostUrlCode(urlInput);
    
    if (existDirDownload(urlCode))
        return console.log(colorStr(`\n >>> This post is already downloaded at: ${colorStr(`${downloadRootDirHandler.path}/${urlCode}`, 'white')}`, 'red'));

    const postId = urlSegmentToInstagramId(urlCode);
    
    try {
        const postData = await getPostInfoById(postId);
        const filteredData = filterMediaInfo(postData.items[0]);
        
        const dirStructure = generateSingleMediaDirStructure(urlCode, filteredData);

        const mediaObjects = generateSingleMediaObjects(filteredData.media);
        const mediaResult = await downloadMediaLoop(mediaObjects, { default: dirStructure.dir }, true);

        for (const result of mediaResult) dirStructure.info.obj.media[result.status].push(result);

        dirStructure.info.save();

        interface.downloadResultLog(dirStructure, mediaResult, false);
    } catch (err) {
        if (err.name == 'IgResponseError') 
            return console.log(colorStr(`\n >>> This post does not exist`, 'red'));
        throw err;
    };
};

module.exports = {
    controlOfDownloadSingleMedia
};