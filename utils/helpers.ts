export const removeDataPoint = (personality: string): string => {
  const personalityPoints = personality.trim().split(/\s+/);
  if (personalityPoints.length <= 10) {
    return "";
  }
  const truncatedPersonality = personalityPoints.slice(0, -12);
  return truncatedPersonality.join(" ");
};

export function containsAtLeastThreeWords(
  input: string,
  words: string[]
): boolean {
  // Normalize the input string to lowercase for case-insensitive matching
  const normalizedInput = input.toLowerCase();

  // Count how many words from the set are found in the input string
  let count = 0;
  for (const word of words) {
    if (normalizedInput.includes(word.toLowerCase())) {
      count++;
      if (count >= 3) return true; // Return true if at least 3 words are found
    }
  }

  return false; // Return false if fewer than 3 words are found
}

export function containsOneWord(input: string, words: string[]): boolean {
  // Normalize the input string to lowercase for case-insensitive matching
  const normalizedInput = input.toLowerCase();

  // Count how many words from the set are found in the input string
  let count = 0;
  for (const word of words) {
    if (normalizedInput.includes(word.toLowerCase())) {
      count++;
      if (count >= 1) return true; // Return true if at least 3 words are found
    }
  }

  return false; // Return false if fewer than 3 words are found
}

export class ServerError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ServerError;
