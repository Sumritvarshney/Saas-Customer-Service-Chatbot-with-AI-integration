import { Configuration } from "openai";

export const configureOpenAI = () => {
  console.log("OPENAI API KEY loaded?", !!process.env.OPEN_AI_SECRET);
  const config = new Configuration({
    apiKey: process.env.OPEN_AI_SECRET,
    organization: process.env.OPENAI_ORAGANIZATION_ID,
  });
  return config;
};

