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

const generateAllMediaPostsObjects = (log, postsDir) => 
    log.obj.posts.flatMap(({ url, id, media }, index, posts) => {
        const postBase = {
            status: 'skip',
            index: null,
            dir: postsDir.path,
            post: {
                url,
                id,
                index
            }
        };

        return generateMediaObjects(media, postBase, posts.length);
    }).map((obj, index) => {
        obj.index = index;
        return obj;
    });

module.exports = {
    generateAllMediaPostsObjects
};