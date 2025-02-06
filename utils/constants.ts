import { config } from "dotenv";
config();

const basePersonality = process.env.BASE_PERSONALITY!;
const personality = process.env.PERSONALITY!;
export const Personality = `${basePersonality} ${personality}`;

export const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
export const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;
export const TWITTER_APP_KEY = process.env.TWITTER_APP_KEY!;
export const TWITTER_APP_SECRET = process.env.TWITTER_APP_SECRET!;
export const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN!;
export const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET!;

export const RUNWAYML_API_SECRET = process.env.RUNWAYML_API_SECRET!;

export const POST_INTERVAL = process.env.POST_INTERVAL || 5;
export const SUPABASE_URL = process.env.SUPABASE_URL || "";
export const SUPABASE_KEY = process.env.SUPABASE_KEY || "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const TWITTER_USERNAME = process.env.TWITTER_USERNAME!;
export const USER_ID = TWITTER_USERNAME;
export const HOST = process.env.HOST;
