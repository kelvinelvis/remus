import axios from "axios";
import { openai } from "./openaiAgent";
import { TWITTER_USERNAME } from "../utils/constants";
import { clientV1 } from "../utils/twitter/config";
export async function uploadMedia(
  url: string | undefined,
  mediaType: "image" | "video"
) {
  try {
    if (!url) throw new Error("image url not found");
    const imageResponse = await axios.get(url, {
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(imageResponse.data);
    const user = await clientV1.v2.userByUsername(TWITTER_USERNAME);
    const mediaId = await clientV1.v1.uploadMedia(imageBuffer, {
      mimeType: mediaType == "image" ? "image/png" : "video/mp4",
      additionalOwners: [user.data.id],
    });
    console.log("Media uploaded successfully. Media ID:", mediaId);
    return mediaId;
  } catch (error) {
    console.error("Error uploading media:", error);
  }
}

export async function generateImageAndUpload(prompt: string) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });

  const uploaded = await uploadMedia(response.data[0].url, "image");
  return uploaded;
}

export async function generateImage(prompt: string) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });

  return response.data[0].url;
}
