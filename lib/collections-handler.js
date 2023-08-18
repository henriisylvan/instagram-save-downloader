const interface = require('./interface/interfaces');

const { colorStr } = require('./interface/interface-tools/colors');
const { getCredentials } = require('./credentials-handler');
const { JsonHandler } = require('./utils');

const collections = new JsonHandler('./settings/collections.json', {});

const changeCollections = (username = getCredentials().username) => {
    collections.obj[username] = [];

    return addCollections(username);
};

const addCollections = async (username = getCredentials().username) => {
    collections.obj[username] = collections.obj[username] || [];

    const collection = {
        name: await interface.collectionNameInput(collections.obj[username]),
        url: await interface.collectionUrlInput(collections.obj[username], username)
    };

    collections.obj[username].push(collection);

    console.log(colorStr('\n >>> Collection Added', 'green'));

    const addMoreCollectionsBool = await interface.askAddMoreCollections();

    if (addMoreCollectionsBool) 
        return await addCollections(username);

    collections.save();

    console.log(colorStr('\n >>> Collections Saved', 'green'));
};

const deleteCollections = (username = getCredentials().username) => {
    delete collections.obj[username];

    collections.save();

    console.log(colorStr('\n >>> Collections Deleted', 'green'));
};

const getCollections = (username = getCredentials().username) => collections.obj[username] || [];

const existsCollections = (username = getCredentials().username) => !!(collections.obj[username]?.length || 0);

module.exports = {
    changeCollections,
    addCollections,
    deleteCollections,
    getCollections,
    existsCollections
};  