export const removeDataPoint = (personality: string): string => {
  const personalityPoints = personality.trim().split(/\s+/);
  if (personalityPoints.length <= 10) {
    return "";
  }
  const truncatedPersonality = personalityPoints.slice(0, -8);
  return truncatedPersonality.join(" ");
};

export class ServerError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ServerError;
