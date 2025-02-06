import express from "express";
import morgan from "morgan";
import cors from "cors";
import AuthRouter from "./routes/auth";
import * as Twitter from "twitter-api-v2";
import { errorMiddleware } from "./middleware/errorMiddleware";
import cron from "node-cron";
import {
  fetchTweetMentions,
  getCurrentSystemText,
  updateSystemText,
} from "./database/supabaseClient";
import { SupabaseClient } from "./database/supabaseClient";
import { Personality, POST_INTERVAL } from "./utils/constants";
import {
  fetchDms,
  fetchUserTweets,
  getReferencedTweetText,
  likeTweet,
  makeTweet,
  replyToTweet,
  retweetTweet,
} from "./utils/twitter/twitterHandler";
import { getTweet, getTweetReply } from "./ai/openaiAgent";
import { GenerateAndFineTune } from "./ai/openaiAgent";
import { containsOneWord, removeDataPoint } from "./utils/helpers";
import { TWITTER_CONFIG } from "./utils/agentConfig";
import { generateNewPersonality } from "./ai/relearn/newPersonality";
import { agentInterests } from "./ai/data/agentInterests";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", AuthRouter);
app.use(morgan("common"));
app.use(errorMiddleware);

// post tweet every interval
// runs based on set interval
cron.schedule(`*/${POST_INTERVAL} * * * *`, async () => {
  try {
    if (!TWITTER_CONFIG.postTweets) return;
    const tweetText = await getTweet();
    const tweet = await makeTweet(tweetText.message, tweetText.media);
    console.log(tweet);
  } catch (e) {
    console.log(e);
  }
});

// Run a job every 5 hours to re-finetune model to accomodate unlearnng
// Runs every 5hrs
cron.schedule("0 */5 * * *", async () => {
  try {
    const prompt = await getCurrentSystemText();
    const newPrompt = removeDataPoint(prompt);
    await GenerateAndFineTune(newPrompt);
    await updateSystemText(newPrompt);
    console.log("successfully fine tuned model");
  } catch (e) {
    console.log(`Something went wrong while filetuning: ${e}`);
  }
});

// Run a job every 2 days to relearn new personality
// Runs every 2 days or set amount of days
cron.schedule("0 0 */2 * *", async () => {
  try {
    const prompt = Personality;
    const personalityToRelearn = await generateNewPersonality(prompt);
    await GenerateAndFineTune(personalityToRelearn);
    await updateSystemText(personalityToRelearn);
    console.log("successfully learnt new personality");
  } catch (e) {
    console.log(`Something went wrong while changing personality ${e}`);
  }
});

// runs every hour
cron.schedule("0 */1 * * *", async () => {
  try {
    if (!TWITTER_CONFIG.directMessages.reply) return;
    const dms = await fetchDms();
    // logic to reply to dms
  } catch (e) {
    console.log(`Something went wrong while fetching dms: ${e}`);
  }
});

// like specific user tweets
// runs every 4hrs
cron.schedule("*/30 * * * *", async () => {
  try {
    const monitoredUsers = TWITTER_CONFIG.listenAccounts.users;
    if (monitoredUsers.length <= 0) return;

    for (const user of monitoredUsers) {
      const userTweets = await fetchUserTweets(user);
      const tweets = userTweets;
      console.log(tweets);

      for (const t of tweets) {
        const tweetExists = await SupabaseClient.from("tagged_tweets")
          .select("*")
          .eq("tweet_id", t.id);
        if (tweetExists.error) throw new Error(tweetExists.error.message);
        if (tweetExists.data.length === 0) {
          const insertTweet = await SupabaseClient.from("tagged_tweets").insert(
            {
              tweet_id: t.id,
              conversation_id: "",
              tweeter: user,
              created_at: new Date().toISOString(),
              referenced_tweet: "",
              tweet_text: t.text,
              saved: true,
            }
          );
          if (insertTweet.error) throw new Error(insertTweet.error.message);
          const containsInterest = containsOneWord(t.text, agentInterests);
          if (!containsInterest) return;
          // await likeTweet(t.id);
          const replyText = await getTweetReply("", t.text);
          const reply = await replyToTweet(replyText, t.id);
          console.log(`Replied to tweet ID: ${t.id}`, reply);
          await retweetTweet(t.id);
          console.log("retweeted");
        }
      }
    }
  } catch (e) {
    console.log(`Something went wrong while fetching user tweets: ${e}`);
  }
});

// Handle replies
// runs every 30mins
cron.schedule("*/15 * * * *", async () => {
  try {
    if (!TWITTER_CONFIG.comments.reply) return;

    const mentions = await fetchTweetMentions();
    for (const tweet of mentions) {
      const {
        conversation_id,
        author_id,
        created_at,
        id,
        text,
        referenced_tweets,
      } = tweet;
      const tweetExists = await SupabaseClient.from("tagged_tweets")
        .select("*")
        .eq("tweet_id", id);
      if (tweetExists.error) throw new Error(tweetExists.error.message);
      if (tweetExists.data.length === 0) {
        if (referenced_tweets && !(referenced_tweets.length === 0)) {
          const insertTweet = await SupabaseClient.from("tagged_tweets").insert(
            {
              tweet_id: id,
              conversation_id,
              tweeter: author_id,
              created_at: created_at,
              referenced_tweet: referenced_tweets[0].id,
              tweet_text: text,
              saved: true,
            }
          );
          if (insertTweet.error) throw new Error(insertTweet.error.message);
          const referenced_tweet = await getReferencedTweetText(
            referenced_tweets[0].id
          );
          const replyText = await getTweetReply(text, referenced_tweet);
          const reply = await replyToTweet(replyText, id);
          console.log(`Replied to tweet ID: ${id}`, reply);
        }
      }
      continue;
    }
  } catch (e) {
    console.log(e);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started and running on port ${PORT}`);
});
