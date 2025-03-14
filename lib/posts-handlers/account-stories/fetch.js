const { handlerStoriesInfo } = require('../items-filter');

const fetchAccountStoriesRecursive = async (storiesFeed, itemsArr = []) => {
    const items = await storiesFeed.items();
    
    const itemsConcat = itemsArr.concat(handlerStoriesInfo(items));

    return storiesFeed.isMoreAvailable() ? fetchAccountStoriesRecursive(savedFeed, itemsConcat) : itemsConcat;
};

const fetchAccountStories = storiesFeed => fetchAccountStoriesRecursive(storiesFeed);

module.exports = fetchAccountStories;