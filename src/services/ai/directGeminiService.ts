/**
 * Direct Gemini API Service
 * 
 * This implementation uses direct API calls to the Gemini API
 * instead of using Langchain, to ensure the correct request format.
 */

import { AIModelConfig, AIService, AIServiceOptions, AIServiceResponse, ReceiptData } from './types';
import { BaseAIService } from './baseAIService';

export class DirectGeminiService extends BaseAIService implements AIService {
  constructor(config: AIModelConfig) {
    super(config);
  }
  
  getAvailableModels(): string[] {
    return [
      'gemini-2.0-flash',
      'gemini-2.0-pro'
    ];
  }
  
  protected async blobToBase64(blob: Blob): Promise<string> {
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
      
      // Create the system prompt
      const systemPrompt = `
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
        - taxAmount: The tax amount if present
        - tipAmount: The tip amount if present
        - paymentMethod: The payment method if available (translated to English)
        - category: The category of purchase (e.g., "Groceries", "Dining", "Entertainment")
        
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
      `;
      
      // Prepare the request payload according to Gemini API documentation
      const payload = {
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: this.config.temperature || 0.2,
          maxOutputTokens: this.config.maxTokens || 1024,
        }
      };
      
      // Make the direct API call
      console.log("Making direct API call to Gemini...");
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.config.apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log("Gemini API response:", JSON.stringify(responseData, null, 2));
      
      // Extract the text from the response
      let responseText = '';
      if (responseData.candidates && responseData.candidates.length > 0) {
        const candidate = responseData.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          responseText = candidate.content.parts[0].text || '';
        }
      }
      
      if (!responseText) {
        throw new Error("No text content in Gemini API response");
      }
      
      // Parse the JSON from the response
      const jsonContent = JSON.parse(this.extractJsonFromText(responseText));
      
      return {
        data: jsonContent,
        error: null,
        raw: responseData
      };
    } catch (error) {
      console.error("Error in DirectGeminiService:", error);
      return this.handleError(error);
    }
  }
  
  // Helper method to extract JSON from text that might contain additional content
  private extractJsonFromText(text: string): string {
    // Try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    // If no JSON object is found, return the original text
    // (this might cause a JSON parse error, but that's expected)
    return text;
  }
}
