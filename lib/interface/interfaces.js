const { readline, booleanReadline, choiceReadline } = require('./interface-tools/readline');
const { colorStr, multiColorStrs } = require('./interface-tools/colors');
const { getOrdinal, folderNameValid, convertMsToTimeFormat, padBoth } = require('../utils');
const { testPostUrl } = require('../downloads/single-posts/get-info');
const { testAccountUrl } = require('../logs/account-posts/get-info');

const spinner = require('./interface-tools/spinner');

const emptyInputLog = async (promptExecution) => {
    const result = await promptExecution();

    if (result) return result;

    console.log(colorStr('\n >>> Empty Input', 'red'));

    return await emptyInputLog(promptExecution);
};


// CREDENTIALS INTERFACE

const askChangeCredentials = currentUsername => booleanReadline('Do you want to change credentials? ' + multiColorStrs(['(Current credentials are from ', currentUsername, ')'], ['gray', 'green', 'gray']));

const getCredentialsInput = async forced => ({
    username: await usernameInput(forced), 
    password: await passwordInput()
});

const usernameInput = forced => emptyInputLog(() => readline(colorStr(`${forced ? '' : '\n'}Enter your Instagram username: `, 'blue')));

const passwordInput = () => emptyInputLog(() => readline(colorStr('\nEnter your Instagram password: ', 'blue'), { password: true }));

const viewCollections = collections => {
    console.log('');

    const maxNameLength = Math.max(...collections.map(collection => collection.name.length));

    for (const collection of collections)
        console.log(multiColorStrs([' - ', '[ ', padBoth(collection.name, maxNameLength, ' '), ' ] | [ ', collection.url, ' ]'], ['green', 'white', 'blue', 'white', 'green', 'white']));
};


// CONNECTION INTERFACE

const checkpointCodeRequest = () => emptyInputLog(() => readline(multiColorStrs(['\nEnter the verification code sent to your email ', '(If you don\'t receive the code, try connecting to another device and restarting this system.)', ': '], ['blue', 'gray', 'blue'])));


// COLLECTION INTERFACE

const collectionNameInput = async (collections) => {
    const ordinalCollectionNumber = getOrdinal(collections.length + 1);

    const name = await emptyInputLog(() => readline(colorStr(`\nEnter the name of the ${ordinalCollectionNumber} collection: `, 'blue')));

    if (!folderNameValid(name)) {
        console.log(colorStr('\n >>> Invalid name, do not use these symbols: \\ / ? % * : | " < > .', 'red'));
    } else if (['__all_post__', '__undefined_collection__', '__no_collection__'].includes(name)){
        console.log(colorStr('\n >>> This name is reserved for the system.', 'red'));  
    } else if (collections.some(collection => collection.name == name)){
        console.log(colorStr('\n >>> A collection with this name already exists.', 'red'));  
    } else {
        return name;
    };
    
    return await collectionNameInput(collections);
};

const collectionUrlTest = (url, username) => {
    const urlReg = `^(?:https?:\\/\\/www\\.)?instagram\\.com\\/${username}\\/saved\\/[^\\/]+\\/[0-9]{17}\\/?(?!.)$`;
    const regTest = new RegExp(urlReg).test(url);
    return regTest;
};

const collectionUrlInput = async (collections, username) => {
    const ordinalCollectionNumber = getOrdinal(collections.length + 1);

    let url = await emptyInputLog(() => readline(multiColorStrs([`\nEnter the url of the ${ordinalCollectionNumber} collection `, `(You can obtain it by accessing your collection through a browser)`, ': '], ['blue', 'gray', 'blue'])));

    url = url.length !== 17 ? url : `https://www.instagram.com/${username}/saved/collection/${url}/`;
    url += url.endsWith('/') ? '' : '/'
    
    if (!collectionUrlTest(url, username)) {
        console.log(multiColorStrs([
            '\n >>> Invalid URL, follow the example or just enter the 17 digits: ', 
            'https://www.instagram.com/',
            username,
            '/saved/collection/',
            '12345678910111213',
            '/'
        ], ['red', 'white', 'green', 'white', 'green', 'white']));
    } else if (collections.some(collection => collection.url.slice(-18) == url.slice(-18))) {
        console.log(colorStr('\n >>> A collection with this URL already exists.', 'red'));  
    } else {
        return url;
    };

    return await collectionUrlInput(collections, username);
};

const askAddMoreCollections = () => booleanReadline('\nDo you want to add more collections?');


// RUN INTERFACE

const runOptionsChoice = choices => choiceReadline('\nWhat do you want?', choices);


// DOWNLOAD SAVED POSTS INTERFACE

const downloadPostsLogChoice = choices => choiceReadline('\nSelect a log for download:', choices);

const askRetrieveUrls = () => booleanReadline('\nThe URLs of this log are obsolete, do you want to recover them?');

const askAsyncDownload = () => booleanReadline(`\nDo you want to download asynchronously? ${colorStr('(Will finish faster, but will consume a lot of CPU and network)', 'gray')}`);

const downloadResultLog = ({ dir: downloadDir, info: downloadInfo }, mediaResult, canTryAgain = true) => {
    const someSuccess = mediaResult.some(media => media.status == 'success');

    if (!someSuccess) return console.log(colorStr('\n >>> No media was downloaded correctly', 'red'));

    const someError = !!downloadInfo.obj.media.error?.length;
    const someSkip = !!downloadInfo.obj.media.skip?.length;

    if (someSkip || someError) console.log('');
    if (someSkip) console.log(colorStr(' >>> The download security limit has been reached, you can continue the download by going back to the options', 'red'));
    if (someError) console.log(colorStr(` >>> Some files were not downloaded correctly${canTryAgain? ', you can try to download them again by going back to the options' : ''}`, 'red'));

    console.log(colorStr('\n >>> Media downloaded in: ', 'green') + downloadDir.path);
};

const selectDownloadDir = async dirs => {
    const choice = await choiceReadline('\nSelect the directory:', dirs.map(dir => ({ value: dir.dir })));
    const selectedDir = dirs[choice];

    return selectedDir;
};


// ACCOUNT POSTS INTERFACE

const getAccountNameInput = async () => {
    let url = await emptyInputLog(() => readline(colorStr('\nEnter the account URL: ', 'blue')));

    url = url.includes('instagram.com/') ? url : `https://www.instagram.com/${url}/`;

    if (!testAccountUrl(url)) {
        console.log(multiColorStrs([
            '\n >>> Invalid URL, follow the example or just enter the account name: ', 
            'https://www.instagram.com/',
            'AbCde12._.345',
            '/'
        ], ['red', 'white', 'green', 'white']));

        return await getAccountNameInput();
    };

    return url;
};


// DOWNLOAD SINGLE POSTS INTERFACE

const getPostUrlInput = async () => {
    let url = await emptyInputLog(() => readline(colorStr('\nEnter the post URL: ', 'blue')));

    url = url.includes('instagram.com/p/') ? url : `https://www.instagram.com/p/${url}/`;

    if (!testPostUrl(url)) {
        console.log(multiColorStrs([
            '\n >>> Invalid URL, follow the example or just enter the 11 characters: ', 
            'https://www.instagram.com/p/',
            'AbCd-12_345',
            '/'
        ], ['red', 'white', 'green', 'white']));

        return await getPostUrlInput();
    };

    return url;
};


// EXECUTION INTERFACE

const generateSpinner = (id = 'spinner', texts = { start: 'Running...', success: 'Success!', fail: 'Fail.' }) => ({
    start: () => {
        console.log('');
        return spinner.start(id, texts.start);
    },
    success: () => spinner.success(id, texts.success),
    fail: () => spinner.close(id, texts.fail)
});

const consoleTime = (label = 'Runtime') => {
    let start;

    return {
        start: () => start = performance.now(),
        finish: () => console.log(multiColorStrs([` >>> ${label}: `, convertMsToTimeFormat(performance.now() - start)], ['green']))
    };
};

module.exports = {
    askChangeCredentials,
    getCredentialsInput,
    checkpointCodeRequest,
    collectionNameInput,
    collectionUrlInput,
    askAddMoreCollections,
    viewCollections,
    runOptionsChoice,
    downloadPostsLogChoice,
    askRetrieveUrls,
    askAsyncDownload,
    downloadResultLog,
    selectDownloadDir,
    getAccountNameInput,
    getPostUrlInput,
    generateSpinner,
    consoleTime,
};