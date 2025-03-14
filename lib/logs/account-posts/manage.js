const instagramRequests = require('../../instagram-manage/content-request');
const interface = require('../../interface/interfaces');
const fetchAccountPosts = require('../../posts-handlers/account-posts/fetch');

const { 
    logRootDirHandler, 
    getNextLogNumber, 
    getAccountNameUrl,
    getAllAccountPostsLogsFileNames,
    getAccountPostsLog,
    checkSafeAccountPostsUrls
} = require('./get-info');

const { JsonHandler } = require('../../utils');
const { colorStr } = require('../../interface/interface-tools/colors');
const { getCredentials } = require('../../credentials-handler');
const { controlOfDownloadAccountsPostsLog } = require('../../downloads/account-posts/manage');

const spinner = interface.generateSpinner();
const runtime = interface.consoleTime();

const generateLogFileName = () => {
    const logNumber = getNextLogNumber();
    const strLogNumber = logNumber.toString().padStart(4, 0);

    return `log_${strLogNumber}.json`;
};

const saveAccountPostsLog = (posts, name, id, url) => {
    const logData = {
        user: getCredentials().username,
        date: new Date(),
        account: {
            name, 
            url, 
            id
        },
        posts
    };

    const logFileName = generateLogFileName();
    const logPath = `${logRootDirHandler.path}/${logFileName}`;
    
    const logHandler = new JsonHandler(logPath, logData);
    logHandler.save();

    return logPath;
};

const generateAccountPostsLog = async (remaining = false) => {
    try {
        const accountUrl = await interface.getAccountNameInput();
        const accountName = getAccountNameUrl(accountUrl);
        const accountId = await instagramRequests.getUserId(accountName);

        const accountFeed = instagramRequests.getAccountPosts(accountId);
        await accountFeed.request();
        
        spinner.start();
        runtime.start();

        const data = await fetchAccountPosts(accountFeed, accountName, { remaining });
        
        if (data.length) {
            const logPath = saveAccountPostsLog(data, accountName, accountId, accountUrl);
    
            spinner.success();
            runtime.finish();
    
            console.log(colorStr(' >>> Amount of posts: ', 'green') + data.length);
            console.log(colorStr(' >>> Log saved in: ', 'green') + logPath);
        } else {
            spinner.fail();
            console.log(colorStr(` >>> There are no ${remaining ? 'remaining ' : ''} posts on this account`, 'red'));
        };
    } catch (err) {
        switch (err.name) {
            case 'IgExactUserNotFoundError':
                console.log(colorStr(` >>> This account does not exist`, 'red'));
            break;
            case 'IgPrivateUserError':
                console.log(colorStr(` >>> This account is private`, 'red'))
            break;
            default:
                throw err;
        };
    };
};

const retrieveAccountPostsUrls = async log => {
    try {
        if (!(await interface.askRetrieveUrls()))
            return console.log(colorStr(`\n >>> Unable to download without retrieving the URLs`, 'red'));
    
        const accountId = log.obj.account.id;

        const accountFeed = instagramRequests.getAccountPosts(accountId);
        await accountFeed.request();
        
        spinner.start();
        runtime.start();
    
        const data = await fetchAccountPosts(accountFeed);
    
        const amountRetrievedUrls = log.obj.posts.reduce((amount, post) => {
            const foundPost = data.find(retrievedPost => retrievedPost.url == post.url);

            post.media = foundPost?.media || post.media;

            return amount + (foundPost ? 1 : 0);
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
    } catch (err) {
        switch (err.name) {
            case 'IgNotFoundError':
                console.log(colorStr(`\n >>> This account does not exist`, 'red'));
            break;
            case 'IgPrivateUserError':
                console.log(colorStr(`\n >>> This account is private`, 'red'))
            break;
            default:
                throw err;
        };

        return false;
    };
};

const selectAccountPostsLogForDownload = async () => {
    const logs = getAllAccountPostsLogsFileNames();

    const choice = await interface.downloadPostsLogChoice(logs.map(log => ({ value: log })));
    const selectedLog = getAccountPostsLog(logs[choice]);

    const safeUrls = await checkSafeAccountPostsUrls(selectedLog);

    if (!safeUrls) {
        const retrieved = await retrieveAccountPostsUrls(selectedLog);
        
        if (!retrieved) return;
    };

    await controlOfDownloadAccountsPostsLog(selectedLog);
};

module.exports = {
    generateAccountPostsLog,
    selectAccountPostsLogForDownload
};