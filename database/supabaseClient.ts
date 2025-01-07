import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import { TwitterClient } from "../utils/twitter/config";
import { USER_ID, SUPABASE_KEY, SUPABASE_URL } from "../utils/constants";

export const SupabaseClient = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_KEY
);

export async function fetchAuthenticatedUser() {
  const { data, error } = await SupabaseClient.from("auth_tokens")
    .select("*")
    .eq("user", USER_ID)
    .eq("active", true)
    .neq("accessToken", null)
    .neq("accessToken", null)
    .neq("accessToken", undefined);
  if (error) throw new Error("could not fetch admin");

  const newestUsers = data.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return data[0];
}

export async function updateRefreshToken(
  accessToken: string,
  newRefreshToken: string | undefined
) {
  const { error, data } = await SupabaseClient.from("auth_tokens")
    .update({
      accessToken,
      refreshToken: newRefreshToken,
    })
    .eq("user", USER_ID);
  if (error) throw new Error("could not update refresh token");
}

export async function getCurrentSystemText() {
  const { error, data } = await SupabaseClient.from("auth_tokens")
    .select("*")
    .eq("user", USER_ID);
  if (error) throw new Error("could not fetch system text");
  return data[0].systemText;
}

export async function createFineTuneRecord(
  prompt: string,
  jobId: string,
  temprature: number,
  modelName: string
) {
  const { error, data } = await SupabaseClient.from("fine_tunes")
    .insert({
      jobId: jobId,
      modelName: modelName,
      temprature: temprature,
      prompt: prompt,
    })
    .single();
  if (error)
    throw new Error(`could not create finetune record: ${error.message}`);
  return data;
}

export async function updateSystemText(systemText: string) {
  const { error, data } = await SupabaseClient.from("auth_tokens")
    .update({ systemText })
    .eq("user", USER_ID);
  if (error) throw new Error("could not update system text");
}

export async function fetchTweetMentions() {
  const user = await fetchAuthenticatedUser();
  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await TwitterClient.refreshOAuth2Token(user.refreshToken);
  await updateRefreshToken(accessToken, newRefreshToken);

  const tweetMentions = await refreshedClient.v2.userMentionTimeline(
    (
      await refreshedClient.v2.me()
    ).data.id,
    {
      max_results: 5,
      "tweet.fields": [
        "conversation_id",
        "author_id",
        "created_at",
        "referenced_tweets",
      ],
      "user.fields": ["username", "name", "profile_image_url", "verified"],
    }
  );
  console.log(tweetMentions.data.data[0].referenced_tweets);
  return tweetMentions.data.data;
}
