import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import { OpenAIApi, ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from "openai";

/**
 * Generate a new chat completion using OpenAI
 */
export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    // ✅ Check if user exists and token is valid
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not registered or token invalid" });
    }

    // Add user message to chat history in database
    user.chats.push({ role: "user", content: message });

    // Use mock response if enabled
    if (process.env.USE_MOCK_OPENAI === "true") {
      const mockResponseContent = "This is a mock response from OpenAI API.";
      user.chats.push({ role: "assistant", content: mockResponseContent });
      await user.save();

      return res.status(200).json({ chats: user.chats });
    }

    // Prepare chat messages for API call
    const chats: ChatCompletionRequestMessage[] = user.chats.map(({ role, content }) => ({
      role: role as ChatCompletionRequestMessageRoleEnum,
      content,
    }));

    // Configure OpenAI
    const config = configureOpenAI();
    const openai = new OpenAIApi(config);

    console.log("Sending request to OpenAI API...");
    let chatResponse;
    try {
      chatResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: chats,
      });
      console.log("OpenAI response received");
    } catch (err: any) {
      if (err.response?.status === 429) {
        console.error("OpenAI rate limit exceeded");
        return res.status(429).json({ message: "OpenAI rate limit exceeded. Try again later." });
      }
      console.error("OpenAI API error:", err.message);
      return res.status(500).json({ message: "OpenAI request failed", cause: err.message });
    }

    // Save assistant response to DB
    const assistantMessage = chatResponse.data.choices[0].message!;
    user.chats.push({
      content: assistantMessage.content!,
      role: assistantMessage.role as ChatCompletionRequestMessageRoleEnum,
    });

    await user.save();

    return res.status(200).json({ chats: user.chats });
  } catch (error: any) {
    console.error("Server error:", error.message);
    return res.status(500).json({ message: "Internal server error", cause: error.message });
  }
};

/**
 * Send all user chats to frontend
 */
export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res.status(401).json({ message: "User not registered or token invalid" });
    }

    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error: any) {
    console.error("Server error:", error.message);
    return res.status(500).json({ message: "Internal server error", cause: error.message });
  }
};

/**
 * Delete all user chats
 */
export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res.status(401).json({ message: "User not registered or token invalid" });
    }

    user.chats.splice(0, user.chats.length);

    await user.save();

    return res.status(200).json({ message: "Chats deleted successfully" });
  } catch (error: any) {
    console.error("Server error:", error.message);
    return res.status(500).json({ message: "Internal server error", cause: error.message });
  }
};
