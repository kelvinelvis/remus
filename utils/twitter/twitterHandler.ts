import {
  fetchAuthenticatedUser,
  updateRefreshToken,
} from "../../database/supabaseClient";
import { TwitterClient, clientApp, clientV1 } from "./config";
import { TWITTER_CONFIG } from "../agentConfig";

export const makeTweet = async (
  text: string,
  media: string | null | undefined
) => {
  try {
    const user = await fetchAuthenticatedUser();
    if (!user) {
      throw new Error("No authenticated user found in the database.");
    }
    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
    } = await TwitterClient.refreshOAuth2Token(user.refreshToken);

    const theUpdateRefreshToken = await updateRefreshToken(
      accessToken,
      newRefreshToken
    );

    if (media) {
      console.log(media);
      const tweet = await refreshedClient.v2.tweet(text, {
        media: { media_ids: [media] },
      });

      if (tweet.errors) {
        console.error("Tweet API returned errors:", tweet.errors);
        throw new Error(
          "Could not post tweet. Check API response for details."
        );
      }

      console.log("Tweet posted successfully:", tweet.data);
      return tweet.data;
    }
    const tweet = await refreshedClient.v2.tweet(text);

    if (tweet.errors) {
      console.error("Tweet API returned errors:", tweet.errors);
      throw new Error("Could not post tweet. Check API response for details.");
    }

    console.log("Tweet posted successfully:", tweet.data);
    return tweet.data;
  } catch (error) {
    console.error("Error in makeTweet function:", error);
  }
};

export const getReferencedTweetText = async (tweetId: string) => {
  const user = await fetchAuthenticatedUser();
  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await TwitterClient.refreshOAuth2Token(user.refreshToken);
  await updateRefreshToken(accessToken, newRefreshToken);

  const tweet = await refreshedClient.v2.singleTweet(tweetId, {
    "tweet.fields": ["text"],
  });
  console.log(tweet);

  if (tweet.errors) {
    throw new Error("Could not fetch referenced tweet");
  }

  return tweet.data.text;
};

export const replyToTweet = async (replyText: string, tweetId: string) => {
  const user = await fetchAuthenticatedUser();
  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await TwitterClient.refreshOAuth2Token(user.refreshToken);
  await updateRefreshToken(accessToken, newRefreshToken);

  const tweeter = await refreshedClient.v2.singleTweet(tweetId, {
    "tweet.fields": ["author_id"],
  });
  if (tweeter.errors || !tweeter.data.author_id)
    throw new Error("Could not fetch tweet author");

  const userData = await refreshedClient.v2.user(tweeter.data.author_id, {
    "user.fields": ["public_metrics"],
  });
  if (!userData.data.public_metrics?.followers_count)
    throw new Error("Could not fetch user data");

  if (TWITTER_CONFIG.comments.replyFilters.minFollowers) {
    const followerCount = userData.data.public_metrics.followers_count;

    if (followerCount < TWITTER_CONFIG.comments.replyFilters.minFollowers) {
      throw new Error("User does not have enough followers to reply");
    }
  }

  // if (TWITTER_CONFIG.comments.replyFilters.verified) {
  //   if (!userData.data.verified) {
  //     throw new Error("User not verified");
  //   }
  // }

  const reply = await refreshedClient.v2.tweet(replyText, {
    reply: { in_reply_to_tweet_id: tweetId },
  });

  if (reply.errors) {
    throw new Error("Could not post reply");
  }

  return reply.data;
};

export const fetchDms = async () => {
  const user = await fetchAuthenticatedUser();
  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await TwitterClient.refreshOAuth2Token(user.refreshToken);
  await updateRefreshToken(accessToken, newRefreshToken);

  const eventTimeline = await refreshedClient.v2.listDmEvents();
  console.log(eventTimeline.events);
};

export const retweetTweet = async (tweetId: string) => {
  const user = await fetchAuthenticatedUser();
  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await TwitterClient.refreshOAuth2Token(user.refreshToken);
  await updateRefreshToken(accessToken, newRefreshToken);

  const twitterUser = await refreshedClient.v2.me();
  const userId = twitterUser.data.id;
  await refreshedClient.v2.retweet(userId, tweetId);
  console.log(`Retweeted tweet with ID: ${tweetId}`);
};

export const fetchUserTweets = async (username: string) => {
  const targetUser = await clientV1.v2.userByUsername(username);
  console.log(targetUser);
  const userTweets = await clientV1.v2.userTimeline(targetUser.data.id, {
    max_results: 5,
  });
  console.log(userTweets.data.data);
  return userTweets.data.data;
};

export const likeTweet = async (tweetId: string) => {
  const user = await fetchAuthenticatedUser();
  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await TwitterClient.refreshOAuth2Token(user.refreshToken);
  await updateRefreshToken(accessToken, newRefreshToken);

  const twitterUser = await refreshedClient.v2.me();
  const userId = twitterUser.data.id;
  console.log(userId);
  console.log(tweetId);
  await refreshedClient.v2.like(userId, tweetId);
  console.log(`Liked tweet with ID: ${tweetId}`);
};

export const listenToTweets = async () => {
  const user = await fetchAuthenticatedUser();
  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await TwitterClient.refreshOAuth2Token(user.refreshToken);
  await updateRefreshToken(accessToken, newRefreshToken);

  const eventTimeline = await refreshedClient.v2.listDmEvents();
  console.log(eventTimeline.events);
};
