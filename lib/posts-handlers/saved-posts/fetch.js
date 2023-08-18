const {
    generateCollectionsStructure, 
    prepareToFilterRemainingPosts, 
    separateItemsByCollection
} = require('./handler');

const fetchSavedPostsRecursive = async (savedFeed, collectionsStructure, filter) => {
    const items = await savedFeed.items();
    const filteredItems = filter?.(items) || items;

    const organizedItems = separateItemsByCollection(filteredItems, collectionsStructure);

    return savedFeed.isMoreAvailable() ? fetchPostsRecursive(savedFeed, organizedItems, filter) : organizedItems;
};

const fetchSavedPosts = (savedFeed, options = { remaining: false }) => {
    const collectionsStructure = generateCollectionsStructure();

    const filter = options.remaining ? prepareToFilterRemainingPosts() : null;

    return fetchSavedPostsRecursive(savedFeed, collectionsStructure, filter);
};

module.exports = fetchSavedPosts;