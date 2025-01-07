import { openai } from "../openaiAgent";

export async function generateNewPersonality(
  oldSystem: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a very smart ai agent assistant that has vast knowledge",
        },
        {
          role: "user",
          content: `I have this ai agent with this as the system text "${oldSystem}". generate another personality based of this given personality, the base personality should not change. but it's view on things can change to contraduct it's previous view. it's the same agent and not a new one. return only the text.`,
        },
      ],
      model: "gpt-4o",
    });

    const message = completion.choices[0].message.content;
    if (!message) throw new Error("No content from OpenAI API");
    console.log(message);
    return message;
  } catch (error) {
    console.error("Error generating tweet:", error);
    return "";
  }
}
