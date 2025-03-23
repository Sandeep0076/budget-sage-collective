/**
 * LangChain Gemini AI Service
 * 
 * Implementation of the AI service using Google's Gemini model through LangChain.
 * Handles receipt image processing with structured output using the Vertex AI API.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AIModelConfig, AIService, AIServiceOptions, AIServiceResponse, ReceiptData } from './types';
import { BaseAIService } from './baseAIService';

export class LangchainGeminiService extends BaseAIService implements AIService {
  constructor(config: AIModelConfig) {
    super(config);
  }
  
  async processReceiptImage(
    imageData: string | Blob, 
    options?: AIServiceOptions
  ): Promise<AIServiceResponse<ReceiptData>> {
    try {
      // Convert Blob to base64 if needed
      let base64Image: string;
      if (imageData instanceof Blob) {
        base64Image = await this.blobToBase64(imageData);
      } else {
        base64Image = imageData;
      }
      
      // Remove data URL prefix if present
      if (base64Image.startsWith('data:image')) {
        base64Image = base64Image.split(',')[1];
      }
      
      // Create LangChain model instance
      const llm = new ChatGoogleGenerativeAI({
        apiKey: this.config.apiKey,
        modelName: this.config.modelName || "gemini-1.5-flash-002",
        maxOutputTokens: this.config.maxTokens || 2048,
        temperature: this.config.temperature || 0.2,
      });
      
      // Create system prompt
      const systemPrompt = `
        You are a multilingual receipt scanning assistant specializing in German to English translation. 
        Your task is to extract all relevant information from the receipt image and translate it into English.
        ${options?.systemPrompt || ''}
        
        IMPORTANT INSTRUCTIONS:
        1. Identify text in the receipt and translate all item names and descriptions to English
        2. Convert date formats to YYYY-MM-DD format
        3. Recognize merchants and translate their names appropriately
        4. Extract the correct tax amount
        5. Handle currency formats correctly
        6. Identify payment methods and translate them
        7. Categorize items based on their translated English names
        
        Respond ONLY with the JSON object. Do not include any explanations or additional text.
      `;
      
      // Construct the LangChain messages
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage({
          content: [
            {
              type: "text",
              text: `Analyze the attached receipt image and extract the following information.
                Return ONLY a JSON object, with no other text.
  
                {
                  "merchant": "string",
                  "date": "string (YYYY-MM-DD format)",
                  "total": number,
                  "items": [
                    {"name": "string", "price": number, "quantity": number (optional)}
                  ],
                  "taxAmount": number (optional),
                  "tipAmount": number (optional),
                  "paymentMethod": "string (optional)",
                  "category": "string (optional)"
                }
                
                If a field cannot be reliably determined, use null for strings and -1 for numbers.
                Do NOT make up information.
                ${options?.prompt || ''}`,
            },
            {
              type: "image_url",
              image_url: `data:image/jpeg;base64,${base64Image}`,
            },
          ],
        }),
      ];
      
      // Invoke the model
      console.log("Invoking LangChain Gemini model...");
      const result = await llm.invoke(messages);
      console.log("LangChain Gemini response received");
      
      // Parse the response
      const content = result.content;
      
      try {
        if (typeof content === 'string') {
          const jsonContent = JSON.parse(this.extractJsonFromText(content));
          return {
            data: jsonContent,
            error: null,
            raw: result
          };
        } else {
          throw new Error("Unexpected content type from model");
        }
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        console.error("Raw content from Gemini:", content);
        return {
          data: null,
          error: "Failed to parse the receipt data. The model's response was not valid JSON.",
          raw: result
        };
      }
    } catch (error) {
      console.error("Error in LangchainGeminiService:", error);
      return this.handleError(error);
    }
  }
  
  getAvailableModels(): string[] {
    return [
      "gemini-1.5-flash-002",
      "gemini-1.5-pro-002",
      "gemini-1.0-pro-vision",
    ];
  }
  
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix if present
        const base64 = base64String.split(',')[1] || base64String;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  private extractJsonFromText(text: string): string {
    // Try to extract JSON object from text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : '{}';
  }
}
