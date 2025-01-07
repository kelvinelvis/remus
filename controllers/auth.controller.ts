import { NextFunction, Request, Response } from "express";
import { TwitterClient, callbackUrl } from "../utils/twitter/config";
import { SupabaseClient } from "../database/supabaseClient";
import { Personality, USER_ID } from "../utils/constants";

export const AuthenticateTwitter = async (
  request: Request,
  response: Response
) => {
  try {
    const { url, codeVerifier, state } = TwitterClient.generateOAuth2AuthLink(
      callbackUrl,
      {
        scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      }
    );

    const { data, error } = await SupabaseClient.from("auth_tokens")
      .insert({
        accessToken: "",
        refreshToken: "",
        code: codeVerifier,
        state,
        user: USER_ID,
        active: false,
      })
      .single();
    if (error) throw error;
    response.redirect(url);
  } catch (e) {
    console.log(`An error occured: ${e}`);
    response.status(400).json({
      message: e,
    });
  }
};

export const TwitterCallback = async (request: Request, response: Response) => {
  const { state, code }: any = request.query;

  const { data, error } = await SupabaseClient.from("auth_tokens")
    .select("*")
    .eq("state", state);
  if (error) throw new Error(error.message);
  const user = data[0];
  console.log(user, data);

  const { accessToken, refreshToken, client } =
    await TwitterClient.loginWithOAuth2({
      code,
      codeVerifier: user.code,
      redirectUri: callbackUrl,
    });

  const updateToken = await SupabaseClient.from("auth_tokens")
    .update({
      accessToken,
      refreshToken,
      systemText: Personality,
      active: true,
    })
    .eq("state", state);
  if (updateToken.error) throw new Error(updateToken.error.message);
  response.status(200).json({
    message: "successfully connected account",
    data: updateToken.data,
  });
};
