import fs from "fs";
import { openai } from "./openaiAgent";
import { USER_ID } from "../utils/constants";

export async function startFineTune(filePath: string, modelName: string) {
  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "fine-tune",
  });

  console.log(file);
  try {
    const job = await openai.fineTuning.jobs.create({
      training_file: file.id,
      model: modelName,
      suffix: USER_ID,
    });
    return job;
  } catch (error) {
    console.error("Error creating fine-tuning job:", error);
    throw error;
  }
}
