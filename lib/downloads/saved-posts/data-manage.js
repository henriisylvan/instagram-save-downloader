const getFileExtension = media => media.type === 'image' && media.extension !== 'gif' ? 'jpg' : media.extension;

const generateMediaFileName = (postIndex, mediaIndex, media, postsAmount) => {
    const postsNumberMaxLength = Math.max(postsAmount.toString().length, 2);
    const postNumber = (postIndex + 1).toString().padStart(postsNumberMaxLength, 0);

    const mediaNumber = (mediaIndex + 1).toString().padStart(2, 0);

    return `post_${postNumber}-media_${mediaNumber}.` + getFileExtension(media);
};

const generateMediaObjects = (medias, base, postsAmount) => medias.map((media, index) => ({ 
    ...base,
    media: { 
        ...media, 
        index, 
        file: generateMediaFileName(base.post.index, index, media, postsAmount)
    }
}));

const generateCollectionMediaPostsObjects = (posts, collectionName, collectionDir) => 
    posts.flatMap(({ url, id, media }, index) => {
        const postBase = {
            status: 'skip',
            index: null,
            collection: {
                name: collectionName,
                dir: collectionDir
            },
            post: {
                url,
                id,
                index
            }
        };

        return generateMediaObjects(media, postBase, posts.length);
    });

const generateAllMediaPostsObjects = (log, collectionsDirs) => 
    log.obj.data.flatMap(({ collection, posts }) => {
        const collectionPath = collectionsDirs[collection].path;

        return generateCollectionMediaPostsObjects(posts, collection, collectionPath);
    }).map((obj, index) => {
        obj.index = index;
        return obj;
    });

module.exports = {
    generateAllMediaPostsObjects
};