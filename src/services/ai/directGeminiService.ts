
/**
 * Direct Gemini AI Service
 * 
 * Implementation of the AI service using Google's Gemini model through direct API calls.
 * Handles receipt image processing with structured output.
 */

import { AIModelConfig, AIService, AIServiceOptions, AIServiceResponse, ReceiptData } from './types';
import { BaseAIService } from './baseAIService';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
    finishReason: string;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}

export class DirectGeminiService extends BaseAIService implements AIService {
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
      
      // Construct the API request payload
      const payload = {
        contents: [
          {
            parts: [
              {
                text: options?.prompt || 'Extract information from this receipt'
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: this.config.temperature || 0.2,
          maxOutputTokens: this.config.maxTokens || 2048,
          topP: 0.9,
          topK: 40
        }
      };
      
      // Make the API request
      console.log('Making direct API call to Gemini...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.modelName}:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      // Check for errors
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${response.status} ${errorData.error?.message || JSON.stringify(errorData)}`);
      }
      
      // Parse the response
      const data: GeminiResponse = await response.json();
      console.log('Gemini API response:', data);
      
      // Extract the text from the response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No text found in the Gemini API response');
      }
      
      // Try to extract JSON from the response
      try {
        // First check if the response is wrapped in markdown code blocks
        let jsonString = text;
        
        // Remove markdown code fences if present
        if (text.includes('```json')) {
          // More robust regex to handle the code blocks
          jsonString = text.replace(/```json\s*\n/g, '').replace(/\n```\s*$/g, '');
          
          // If the above didn't work, try a more aggressive approach
          if (jsonString.includes('```')) {
            // Extract everything between the first and last backtick groups
            const match = text.match(/```json\s*\n([\s\S]*?)\n```/);
            if (match && match[1]) {
              jsonString = match[1];
            } else {
              // If still not working, just remove all backticks
              jsonString = text.replace(/```json/g, '').replace(/```/g, '');
            }
          }
        }
        
        // Try to parse the JSON - could be an object or an array
        const parsedData = JSON.parse(jsonString.trim());
        
        // Check if we got an array (common from Gemini) or a properly structured object
        if (Array.isArray(parsedData)) {
          // We got an array of items, need to transform to ReceiptData structure
          const today = new Date().toISOString().split('T')[0];
          
          // Transform the items into the expected ReceiptItem format
          const receiptItems = parsedData.map(item => ({
            name: item.description || 'Unknown Item',
            price: Math.abs(item.amount) || 0,
            quantity: 1,
            category: item.category || 'General Merchandise'
          }));
          
          // Calculate total from all items
          const total = receiptItems.reduce((sum, item) => sum + item.price, 0);
          
          // Create properly structured ReceiptData object
          const receiptData: ReceiptData = {
            merchant: 'Receipt Scan',
            date: parsedData[0]?.date || today,
            total: total,
            items: receiptItems,
            category: 'General Merchandise'
          };
          
          return {
            data: receiptData,
            error: null,
            raw: data
          };
        } else if (parsedData.items) {
          // Already in the expected format
          return {
            data: parsedData as ReceiptData,
            error: null,
            raw: data
          };
        } else {
          // Try to adapt a single item to the expected format
          const receiptData: ReceiptData = {
            merchant: parsedData.merchant || 'Receipt Scan',
            date: parsedData.date || new Date().toISOString().split('T')[0],
            total: parsedData.amount ? Math.abs(parsedData.amount) : 0,
            items: [{
              name: parsedData.description || 'Unknown Item',
              price: parsedData.amount ? Math.abs(parsedData.amount) : 0,
              quantity: 1,
              category: parsedData.category || 'General Merchandise'
            }],
            category: parsedData.category || 'General Merchandise'
          };
          
          return {
            data: receiptData,
            error: null,
            raw: data
          };
        }
      } catch (parseError) {
        console.error('Error parsing JSON from response:', parseError);
        return {
          data: null,
          error: 'Failed to parse the receipt data. The model response was not valid JSON.',
          raw: data
        };
      }
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
      
      // Construct the API request payload
      const payload = {
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: this.config.temperature || 0.2,
          maxOutputTokens: this.config.maxTokens || 2048,
          topP: 0.9,
          topK: 40
        }
      };
      
      // Make the API request
      console.log('Making direct API call to Gemini...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.modelName}:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      // Check for errors
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${response.status} ${errorData.error?.message || JSON.stringify(errorData)}`);
      }
      
      // Parse the response
      const data: GeminiResponse = await response.json();
      console.log('Gemini API response:', data);
      
      // Extract the text from the response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No text found in the Gemini API response');
      }
      
      return text;
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
}
