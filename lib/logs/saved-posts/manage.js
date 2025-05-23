const instagramRequests = require('../../instagram-manage/content-request');
const interface = require('../../interface/interfaces');
const fetchSavedPosts = require('../../posts-handlers/saved-posts/fetch');

const {
    logRootDirHandler,
    getNextLogNumber,
    getAllSavedPostsLogsFileNames,
    getSavedPostsLog,
    checkSafeSavedPostsUrls
} = require('./get-info');

const { JsonHandler } = require('../../utils');
const { colorStr } = require('../../interface/interface-tools/colors');
const { getCredentials } = require('../../credentials-handler');
const { controlOfDownloadSavedPostsLog } = require('../../downloads/saved-posts/manage');

const spinner = interface.generateSpinner();
const runtime = interface.consoleTime();

const generateLogFileName = () => {
    const logNumber = getNextLogNumber();
    const strLogNumber = logNumber.toString().padStart(4, 0);

    return `log_${strLogNumber}.json`;
};

const saveSavedPostsLog = data => {
    const logData = {
        user: getCredentials().username,
        date: new Date(),
        data
    };

    const logFileName = generateLogFileName();
    const logPath = `${logRootDirHandler.path}/${logFileName}`;
    
    const logHandler = new JsonHandler(logPath, logData);
    logHandler.save();

    return logPath;
};

const generateSavedPostsLog = async (remaining = false) => {
    spinner.start();
    runtime.start();

    const savedFeed = instagramRequests.getSavedFeed();
    
    const data = await fetchSavedPosts(savedFeed, { remaining });

    if (data[0].posts.length) {
        const logPath = saveSavedPostsLog(data);

        spinner.success();
        runtime.finish();

        console.log(colorStr(' >>> Amount of posts: ', 'green') + data[0].posts.length);
        console.log(colorStr(' >>> Log saved in: ', 'green') + logPath);
    } else {
        spinner.fail();
        console.log(colorStr(` >>> There are no ${remaining ? 'remaining ' : ''}saved posts`, 'red'));
    };
};

const retrieveSavedPostsUrls = async log => {
    const { username } = getCredentials();

    if (!(await interface.askRetrieveUrls()))
        return console.log(colorStr(`\n >>> Unable to download without retrieving the URLs`, 'red'));

    if (username !== log.obj.user)
        return console.log(colorStr(`\n >>> You need to be logged into the ${username} account to retrieve the URLs for this record`, 'red'));

    spinner.start();
    runtime.start();

    const savedFeed = instagramRequests.getSavedFeed();
    const data = await fetchSavedPosts(savedFeed);

    const amountRetrievedUrls = log.obj.data.reduce((retrievedAmount, collection) => {
        return retrievedAmount + collection.posts.reduce((amount, post) => {
            const foundPost = data[0].posts.find(retrievedPost => retrievedPost.url == post.url);

            post.media = foundPost?.media || post.media;

            return amount + (foundPost ? 1 : 0);
        }, 0);
    }, 0);
    
    if (amountRetrievedUrls) {
        log.save();

        spinner.success();
        runtime.finish();

        console.log(colorStr(`\n >>> ${amountRetrievedUrls} URLs retrieved`, 'green'));
    } else {
        spinner.fail();
        console.log(colorStr(`\n >>> No URL retrieved`, 'red'));
    };

    return !!amountRetrievedUrls;
};

const selectSavedPostsLogForDownload = async () => {
    const logs = getAllSavedPostsLogsFileNames();

    const choice = await interface.downloadPostsLogChoice(logs.map(log => ({ value: log })));
    const selectedLog = getSavedPostsLog(logs[choice]);

    const safeUrls = await checkSafeSavedPostsUrls(selectedLog);

    if (!safeUrls) {
        const retrieved = await retrieveSavedPostsUrls(selectedLog);
        
        if (!retrieved) return;
    };

    await controlOfDownloadSavedPostsLog(selectedLog);
};

module.exports = {
    generateSavedPostsLog,
    selectSavedPostsLogForDownload
};