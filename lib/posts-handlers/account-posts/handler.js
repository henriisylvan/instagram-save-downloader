const { getAccountLogsByAccount } = require("../../logs/account-posts/get-info");

const filterRemainingPosts = (allPosts, items) => 
    items.filter(media => !allPosts.some(post => post.url == `https://www.instagram.com/p/${media.code}`));

const prepareToFilterRemainingPosts = account => {    
    const allPosts = getAccountLogsByAccount(account).flatMap(log => log.obj.posts);
    
    return items => filterRemainingPosts(allPosts, items);
};

module.exports = {
    prepareToFilterRemainingPosts
};