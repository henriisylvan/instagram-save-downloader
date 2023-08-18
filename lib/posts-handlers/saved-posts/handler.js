const { getCredentials } = require('../../credentials-handler');
const { getCollections } = require('../../collections-handler');
const { getAllSavedPostsLogs } = require('../../logs/saved-posts/get-info');
const { handlerItemsInfo } = require('../items-filter');
const { removeRepeatedValues } = require('../../utils');

const getCollectionCode = url => url.split('/').slice(-2, -1)[0];

const generateCollectionsStructure = () => {
    const { username } = getCredentials();
    const collections = getCollections(username);
    
    if (!collections.length)
        return [
            {
                collection: '__all_posts__',
                allPosts: true,
                url: `https://www.instagram.com/${username}/saved/all-posts/`,
                posts: []
            }
        ];

    const collectionsStructure = collections.map(collection => ({
        collection: collection.name,
        code: getCollectionCode(collection.url),
        posts: []
    }));

    const aditionalCollections = [
        {
            collection: '__all_posts__',
            url: `https://www.instagram.com/${username}/saved/all-posts/`,
            posts: []
        },
        {
            collection: '__undefined_collection__',
            collectionCodes: [],
            posts: []
        },
        {
            collection: '__no_collection__',
            notInCollections: true,
            posts: []
        },
    ];

    return aditionalCollections.concat(collectionsStructure);
};

const filterRemainingPosts = (allPosts, items) => 
    items.filter(media => 
        !allPosts.some(post => 
            post.url == `https://www.instagram.com/p/${media.code}` && media.saved_collection_ids.every(code => post.collectionIds.includes(code))
        )
    );

const prepareToFilterRemainingPosts = () => {
    const { username } = getCredentials();
    
    const allPosts = getAllSavedPostsLogs().flatMap(log => log.obj.user == username ? log.obj.data[0].posts : []);
    
    return items => filterRemainingPosts(allPosts, items);
};

const getUndefinedCollectionCodes = (post, definedCollectionCodes) => post.collectionIds.filter(code => !definedCollectionCodes.includes(code));

const separateItemsByCollection = (items, collectionsStructure) => {
    const allPost = handlerItemsInfo(items, true);

    for (const collectionIndex in collectionsStructure) {
        const { collection, code, collectionCodes } = collectionsStructure[collectionIndex];

        switch (collection) {
            case '__all_posts__':
                collectionsStructure[collectionIndex].posts.push(...allPost);
            break;

            case '__undefined_collection__':
                const definedCollectionCodes = collectionsStructure.slice(3).map(collection => collection.code);

                const undefinedCollectionCodesMatrix = allPost.map(post => getUndefinedCollectionCodes(post, definedCollectionCodes));
                
                const postsWithUndefinedCollection = allPost.filter((post, index) => undefinedCollectionCodesMatrix[index].length);
                const undefinedCollectionCodes = undefinedCollectionCodesMatrix.flat();
                
                collectionsStructure[collectionIndex].posts.push(...postsWithUndefinedCollection);
                collectionsStructure[collectionIndex].collectionCodes = removeRepeatedValues([ ...collectionCodes, ...undefinedCollectionCodes ]);
            break;

            case '__no_collection__':
                const postsWithoutCollections = allPost.filter(post => !post.collectionIds.length);

                collectionsStructure[collectionIndex].posts.push(...postsWithoutCollections);
            break;

            default:
                const colletionPosts = allPost.filter(post => post.collectionIds.includes(code));
            
                collectionsStructure[collectionIndex].posts.push(...colletionPosts);
        };
    };

    return collectionsStructure;
};

module.exports = {
    generateCollectionsStructure,
    prepareToFilterRemainingPosts,
    separateItemsByCollection
};