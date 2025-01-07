import OpenAI from "openai";
import { OPENAI_API_KEY } from "../utils/constants";
import { generateTrainingData } from "./relearn/generateTrainingData";
import { startFineTune } from "./startFineJuneJob";
import {
  createFineTuneRecord,
  getCurrentSystemText,
} from "../database/supabaseClient";
import { generateImage, generateImageAndUpload } from "./generateImage";
import { generateVideo } from "./generateVideo";
import { promptsList } from "./data/prompts";

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function getLatestFineTunedModel() {
  try {
    const response = await openai.models.list();
    const models = response.data;

    const fineTunedModels = models
      .filter((model) => model.id.includes("ft:"))
      .filter((model) => model.id.includes("mini"))
      .sort((a, b) => b.created - a.created)
      .sort((a, b) => a.id.length - b.id.length);

    if (fineTunedModels.length === 0) {
      return "No fine-tuned models found.";
    }
    return fineTunedModels[0];
  } catch (error) {
    console.error("Error fetching models:", error);
    return null;
  }
}

export async function GenerateAndFineTune(promptText: string) {
  const prompt = promptText;
  const temperature = 0.9;
  const numberOfExamples = 50;
  const maxRetries = 3;
  const modelName = "gpt-4o-mini-2024-07-18";

  const { filePath, success } = await generateTrainingData(
    prompt,
    temperature,
    numberOfExamples,
    maxRetries
  );

  const fineTuneJob = await startFineTune(filePath, modelName);
  console.log("Fine-tune job:", fineTuneJob);
  await createFineTuneRecord(prompt, fineTuneJob.id, temperature, modelName);
  console.log("Fine-tuning job started!");
}

export async function getTweet() {
  console.log("Generating tweet text");
  const randomNumber = Math.floor(Math.random() * promptsList.length);
  const prompt = await getCurrentSystemText();
  const selectedPrompt = promptsList[5];

  try {
    const fineTuneModel = await getLatestFineTunedModel();
    if (fineTuneModel == null || fineTuneModel == "No fine-tuned models found.")
      throw new Error("No fine-tuned model found");
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: `generate a tweet based on ${selectedPrompt.prompt}, without using "let's", with no hashtags or emojis and don't mention that it's a tweet`,
        },
      ],
      model: fineTuneModel.id,
    });

    const message = completion.choices[0].message.content;
    if (!message) throw new Error("No content from OpenAI API");

    if (selectedPrompt.image || selectedPrompt.video) {
      const videoCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "An image description generator",
          },
          {
            role: "user",
            content: `generate a very accurate description of an image based on this text ${message}. reply with only the description`,
          },
        ],
        model: "gpt-4o-mini",
      });
      const medMessage = videoCompletion.choices[0].message.content;
      if (!medMessage) throw new Error("No content from OpenAI API");

      if (selectedPrompt.image) {
        const generatedImage = await generateImageAndUpload(medMessage);
        return { message, media: generatedImage };
      }
      if (selectedPrompt.video) {
        const generatedVideo = await generateVideo(medMessage);
        if (!generatedVideo) throw new Error("could not generate video");
        return {
          message,
          media: generatedVideo.video ? generatedVideo.video : "",
        };
      }
    }

    console.log("tweet generated: ", message);
    return { message, media: null };
  } catch (error) {
    console.error("Error generating tweet:", error);
    return { message: "", media: null };
  }
}

export async function getTweetReply(text: string, referencedTweet: string) {
  console.log("Generating tweet text");

  try {
    const prompt = await getCurrentSystemText();

    const fineTuneModel = await getLatestFineTunedModel();
    if (fineTuneModel == null || fineTuneModel == "No fine-tuned models found.")
      throw new Error("No fine-tuned model found");
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${prompt}. Keep replies very short and concise(not more than 10 words). especially when dealing with emoji replies`,
        },
        {
          role: "user",
          content: `Using this as context "${referencedTweet}", respond to this tweet reply "${text}  without using emojis, hashtags,  any tags, tagging anyone or using quotes or mentioning that it's a tweet."`,
        },
      ],
      model: fineTuneModel.id,
    });

    const message = completion.choices[0].message.content;
    if (!message) throw new Error("No content from OpenAI API");
    return message;
  } catch (error) {
    console.error("Error generating tweet:", error);
    return "";
  }
}
