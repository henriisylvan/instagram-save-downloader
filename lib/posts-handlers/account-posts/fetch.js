const { prepareToFilterRemainingPosts } = require('./handler');
const { handlerItemsInfo } = require('../items-filter');

const fetchAccountPostsRecursive = async (accountFeed, filter, itemsArr = []) => {
    const items = await accountFeed.items();
    const filteredItems = filter?.(items) || items;
    
    const itemsConcat = itemsArr.concat(handlerItemsInfo(filteredItems));

    return accountFeed.isMoreAvailable() ? fetchAccountPostsRecursive(savedFeed, filter, itemsConcat) : itemsConcat;
};

const fetchAccountPosts = (accountFeed, accountName, options = { remaining: false }) => {
    const filter = options.remaining ? prepareToFilterRemainingPosts(accountName) : null;

    return fetchAccountPostsRecursive(accountFeed, filter);
};

module.exports = fetchAccountPosts;