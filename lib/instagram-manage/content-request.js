const instagram = require('./connection');

const getUserId = username => instagram.client.user.getIdByUsername(username);

const getUserInfo = id => instagram.client.user.info(id);

const getCurrentUserInfo = () => instagram.client.account.currentUser();

const getSavedFeed = () => instagram.client.feed.saved();

const getPostInfoById = id => instagram.client.media.info(id);

const getAccountPosts = id => instagram.client.feed.user(id);

const getUserStoriesFeed = id => instagram.client.feed.userStory(id);

module.exports = {
    getUserId,
    getCurrentUserInfo,
    getUserInfo,
    getSavedFeed,
    getPostInfoById,
    getAccountPosts,
    getUserStoriesFeed
};