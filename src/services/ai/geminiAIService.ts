
/**
 * Gemini AI Service
 * 
 * Implementation of the AI service using Google's Gemini model through Langchain.
 * Handles receipt image processing with structured output.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage } from "@langchain/core/messages";
import { AIModelConfig, AIService, AIServiceOptions, AIServiceResponse, ReceiptData } from './types';
import { BaseAIService } from './baseAIService';

export class GeminiAIService extends BaseAIService implements AIService {
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
      
      // Create model with Langchain
      const model = new ChatGoogleGenerativeAI({
        apiKey: this.config.apiKey,
        modelName: this.config.modelName || "gemini-2.0-flash",
        maxOutputTokens: this.config.maxTokens,
        temperature: this.config.temperature || 0.2,
      });
      
      // Setup JSON output parser
      const parser = new JsonOutputParser<ReceiptData>();
      
      // Create prompt template
      const promptTemplate = PromptTemplate.fromTemplate(`
        You are a multilingual receipt scanning assistant specializing in German to English translation. The provided receipt image is most likely in German. Your task is to extract all relevant information and translate it into English.
        ${options?.systemPrompt || ''}
        
        IMPORTANT INSTRUCTIONS:
        1. Identify German text in the receipt and translate all item names and descriptions to English
        2. Convert German date formats (DD.MM.YYYY) to YYYY-MM-DD format
        3. Recognize German merchants and translate their names appropriately
        4. Understand German tax terminology ("MwSt", "USt", etc.) and extract the correct tax amount
        5. Handle German currency formats (using comma as decimal separator)
        6. Identify German payment methods ("EC-Karte", "Bar", etc.) and translate them
        7. Categorize items based on their translated English names
        
        Extract the following information in a structured JSON format:
        - merchant: The name of the store or business (translated to English)
        - date: The date of purchase in YYYY-MM-DD format
        - total: The total amount as a number (no currency symbols)
        - items: An array of items purchased, each with:
          - name: The item name TRANSLATED TO ENGLISH
          - price: The item price as a number
          - quantity: The quantity if available
          - category: The category for this specific item if available
        - taxAmount: The tax amount if present
        - tipAmount: The tip amount if present
        - paymentMethod: The payment method if available (translated to English)
        - category: The general category of purchase (e.g., "Groceries", "Dining", "Entertainment")
        
        ${options?.prompt || ''}
        
        Common German-English translations for receipt items:
        - "Gesamtbetrag" → "Total amount"
        - "MwSt" or "USt" → "VAT/Tax"
        - "Bargeld" or "Bar" → "Cash"
        - "EC-Karte" or "Girocard" → "Debit card"
        - "Kreditkarte" → "Credit card"
        - "Trinkgeld" → "Tip"
        - "Rabatt" → "Discount"
        - "Zwischensumme" → "Subtotal"
        
        Respond ONLY with the JSON object. Do not include any explanations or additional text.
      `);
      
      // Create the chain
      const chain = promptTemplate.pipe(model).pipe(parser);
      
      // Create a human message with text and image using the correct format
      const message = new HumanMessage({
        content: [
          {
            type: "text",
            text: promptTemplate.format({})
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      });
      
      // Process the image with proper message format
      const response = await model.invoke([message]);
      
      // Parse the response
      const content = response.content;
      let jsonContent: ReceiptData;
      
      // Handle different response formats
      if (typeof content === 'string') {
        jsonContent = JSON.parse(this.extractJsonFromText(content));
      } else if (Array.isArray(content)) {
        const textParts = content
          .filter(part => typeof part === 'object' && part !== null)
          .map(part => {
            if ('text' in part) {
              return part.text as string;
            }
            return '';
          });
        const jsonText = this.extractJsonFromText(textParts.join(''));
        jsonContent = JSON.parse(jsonText);
      } else {
        throw new Error('Unexpected response format');
      }
      
      return {
        data: jsonContent,
        error: null,
        raw: response
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  async generateContent(prompt: string, imageData: string | Blob): Promise<string> {
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
      
      // Create model with Langchain
      const model = new ChatGoogleGenerativeAI({
        apiKey: this.config.apiKey,
        modelName: this.config.modelName || "gemini-2.0-flash",
        maxOutputTokens: this.config.maxTokens || 2048,
        temperature: this.config.temperature || 0.2,
      });
      
      // Create a human message with text and image
      const message = new HumanMessage({
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      });
      
      // Process the image
      const response = await model.invoke([message]);
      
      // Return the content as string
      if (typeof response.content === 'string') {
        return response.content;
      } else if (Array.isArray(response.content)) {
        return response.content
          .filter(part => typeof part === 'object' && part !== null && 'text' in part)
          .map(part => (part as any).text)
          .join('');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error in generateContent:', error);
      throw error;
    }
  }
  
  getAvailableModels(): string[] {
    return [
      'gemini-2.0-flash',
      'gemini-2.0-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];
  }
  
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix
        const base64 = base64String.split(',')[1];
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
