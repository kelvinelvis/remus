export const TWITTER_CONFIG = {
  postTweets: true, // SWITCH FOR POSTS
  comments: {
    reply: true, // REPLY COMMENTS OR NOT
    replyFilters: {
      minFollowers: 500, // MINIMUM FOLLOWERS A USER SHOULD HAVE BEFORE REPLYING
      verified: false, // CHECK WHETHER USER IS VERIFIED OR NOT
      users: [""], // REPLY TO ONLY SPECIFIC USERS
    },
  },
  directMessages: {
    reply: false, // REPLY DMS OR NOT
    replyFilters: {
      minFollowers: 500, // MINIMUM FOLLOWERS A USER SHOULD HAVE BEFORE REPLYING
      verified: false, // CHECK WHETHER USER IS VERIFIED OR NOT
    },
  },
  listenAccounts: {
    users: ["cryptoloree"], // USERNAME OF ACCCOUNTS TO FOLLOW AND MONITOR
    like: true, // LIKE ACCOUNT POST OR NOT
    retweet: true, // RETWEET POST OR NOT
  },
};
