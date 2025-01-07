import RunwayML from "@runwayml/sdk";
import { RUNWAYML_API_SECRET } from "../utils/constants";
import { generateImage, uploadMedia } from "./generateImage";

const client = new RunwayML({
  apiKey: RUNWAYML_API_SECRET,
});

export async function generateVideo(prompt: string) {
  const generatedImage = await generateImage(prompt);
  if (!generatedImage) return;

  const imageToVideo = await client.imageToVideo.create({
    model: "gen3a_turbo",
    promptImage: generatedImage,
    promptText: `a video illustrating(${prompt}`,
    duration: 5,
  });

  const taskId = imageToVideo.id;
  let task: Awaited<ReturnType<typeof client.tasks.retrieve>>;
  do {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    task = await client.tasks.retrieve(taskId);
  } while (!["SUCCEEDED", "FAILED"].includes(task.status));
  if (!task.output || task.output.length <= 0 || task.status == "FAILED")
    throw new Error("video could not be generated");
  console.log(task.output);
  const uploaded = await uploadMedia(task.output[0], "video");
  return { status: task.status, video: uploaded };
}
