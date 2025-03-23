/**
 * Test file for Gemini API
 * 
 * This file demonstrates the correct way to call the Gemini API
 * with image data according to the latest Langchain implementation.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

async function testGeminiAPI(apiKey: string, base64Image: string) {
  try {
    // Create the model with minimal configuration
    const model = new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      modelName: "gemini-2.0-flash",
    });

    // Create a human message with text and image
    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: "Extract all information from this receipt image and return it as JSON."
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`
          }
        }
      ]
    });

    // Call the model with the message
    console.log("Calling Gemini API...");
    const response = await model.invoke([message]);
    console.log("Response received:", response);
    
    return response.content;
  } catch (error) {
    console.error("Error in testGeminiAPI:", error);
    throw error;
  }
}

export { testGeminiAPI };
