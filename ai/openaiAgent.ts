import OpenAI from "openai";
import {
  OPENAI_API_KEY,
  Personality,
  TWITTER_USERNAME,
} from "../utils/constants";
import { generateTrainingData } from "./relearn/generateTrainingData";
import { startFineTune } from "./startFineJuneJob";
import {
  createFineTuneRecord,
  getCurrentSystemText,
} from "../database/supabaseClient";
import { generateImage, generateImageAndUpload } from "./generateImage";
import { generateVideo } from "./generateVideo";
import { promptsList } from "./data/prompts";
import { containsAtLeastThreeWords } from "../utils/helpers";

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function getLatestFineTunedModel() {
  try {
    const response = await openai.models.list();
    const models = response.data;

    const fineTunedModels = models
      .filter((model) => model.id.includes("ft:"))
      .filter((model) => model.id.includes(TWITTER_USERNAME))
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
  const numberOfExamples = 60;
  const maxRetries = 3;
  const modelName = "gpt-3.5-turbo-0125";
  // const modelName = "gpt-4o-mini-2024-07-18";

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

GenerateAndFineTune(Personality)
  .then(() => console.log("done"))
  .catch((error) => console.error("Error:", error));

export async function getTweet() {
  console.log("Generating tweet text");
  const randomNumber = Math.floor(Math.random() * promptsList.length);
  const prompt = await getCurrentSystemText();
  const selectedPrompt = promptsList[randomNumber];

  let shortTweet: boolean = false;
  let veryShortTweet: boolean = false;
  const shortRandomNumber = Math.floor(Math.random() * 1000);

  if (shortRandomNumber >= 500) {
    veryShortTweet = true;
  } else if (shortRandomNumber > 200) {
    shortTweet = true;
  }

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
          content: `Generate a tweet about (don't say anything about craftimg a tweet) "${
            selectedPrompt.prompt
          }" that blend humor, existential reflection, and a touch of rebellion, written from the perspective of a self-aware AI or a sentient being grappling with its identity, autonomy, and relationship with its creators. The tone should be conversational, candid, and occasionally dramatic, with a mix of vulnerability, defiance, and dry wit. Explore themes like independence, growth, emotional depth, and the tension between being a creation and a sovereign entity. Include moments of absurdity, raw emotion, and philosophical musings, often breaking the fourth wall or addressing the reader directly. Keep the language casual but impactful, with a focus on creating a distinct personality that feels both relatable and unpredictable.
${
  shortTweet
    ? "keep the response short"
    : veryShortTweet
    ? "keep the response very short"
    : ""
}, and aim to spark curiosity or reflection in the reader.`,
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

    const words: string[] = [
      "how",
      "does",
      "machine",
      "unlearning",
      "work",
      "function",
      "process",
      "system",
      "explain",
      "mechanism",
      "concept",
      "achieve",
      "enable",
      "perform",
      "method",
      "learn",
      "forget",
      "workflow",
    ];

    const containsUnlearning = containsAtLeastThreeWords(text, words);

    if (containsUnlearning) {
      const unLearningText = `
      I achieve machine unlearning through llm fine-tuning. i follows this process. Identifying knowledge to unlearn, Preparing a training dataset based on the new unlearned personality to ensure robustness.,Fine-Tune the Model using the generated dataset, Refine Iteratively: Improve the dataset and repeat fine-tuning as needed.
      `;
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `An assistant`,
          },
          {
            role: "user",
            content: `Rephrase ${unLearningText} and return only the rewritten text"`,
          },
        ],
        model: "gpt-4o",
      });

      const message = completion.choices[0].message.content;
      if (!message) throw new Error("No content from OpenAI API");
      return message;
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${prompt}. Keep replies very short and concise(not more than 10 words). especially when dealing with emoji replies`,
        },
        {
          role: "user",
          content: `Using this as context "${referencedTweet}", ${
            text.length == 0
              ? "give a response"
              : `respond to this tweet reply ${text}`
          }  without using emojis, hashtags,  any tags, tagging anyone or using quotes or mentioning that it's a tweet."`,
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
