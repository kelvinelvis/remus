import * as Twitter from "twitter-api-v2";
import {
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
  TWITTER_ACCESS_TOKEN,
  TWITTER_APP_KEY,
  TWITTER_APP_SECRET,
  TWITTER_ACCESS_SECRET,
  HOST,
} from "../constants";

const TwitterApi = Twitter.default;

export const callbackUrl = `${HOST}/auth/callback`;

export const TwitterClient = new TwitterApi({
  clientId: `${TWITTER_CLIENT_ID}`,
  clientSecret: TWITTER_CLIENT_SECRET,
});

export const clientV1 = new TwitterApi({
  appKey: TWITTER_APP_KEY,
  appSecret: TWITTER_APP_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_SECRET,
});
