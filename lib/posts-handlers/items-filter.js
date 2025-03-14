const getUrlsFromCandidates = (candidates, isVideo) => {
    const bestQualityCandidate = candidates.sort((a, b) => b.width - a.width)[0];

    return {
        url: bestQualityCandidate.url,
        extension: bestQualityCandidate.url.split('?')[0].split('.').pop(),
        type: isVideo ? 'video' : 'image'
    };
};

const getUrlsFromCarousel = carousel => carousel.map(media => {
    const candidates = media.video_versions || media.image_versions2.candidates;
    return getUrlsFromCandidates(candidates, !!media.video_versions);
});

const getMediaUrls = media => {
    if (media.carousel_media) 
        return getUrlsFromCarousel(media.carousel_media);

    const candidates = media.video_versions || media.image_versions2.candidates;
    return [ getUrlsFromCandidates(candidates, !!media.video_versions) ];
};

const filterMediaInfo = (media, savedMedia = false) => ({
    url: `https://www.instagram.com/p/${media.code}`,
    id: media.pk,
    caption: media.caption?.text || '',
    ...(savedMedia ? { collectionIds: media.saved_collection_ids || [] } : {}),
    media: getMediaUrls(media)
});

const handlerItemsInfo = (items, savedMedia = false) => items.map(item => filterMediaInfo(item, savedMedia));

const filterStoriesMediaInfo = media => ({
    url: `https://www.instagram.com/stories/${media.user.username}/${media.pk}`,
    id: media.pk,
    media: getMediaUrls(media)
});

const handlerStoriesInfo = items => items.map(item => filterStoriesMediaInfo(item));

module.exports = {
    handlerItemsInfo,
    handlerStoriesInfo,
    filterMediaInfo
};