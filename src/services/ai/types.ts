
/**
 * AI Service Types
 * 
 * This file defines the types and interfaces for the AI service layer,
 * allowing for easy model switching and consistent response handling.
 */

export interface ReceiptData {
  merchant: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  taxAmount?: number;
  tipAmount?: number;
  paymentMethod?: string;
  category?: string;
}

export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
  category?: string;
}

export interface AIModelConfig {
  modelName: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIServiceResponse<T> {
  data: T | null;
  error: string | null;
  raw?: any;
}

export interface AIServiceOptions {
  prompt?: string;
  systemPrompt?: string;
}

export interface AIService {
  processReceiptImage(
    imageData: string | Blob, 
    options?: AIServiceOptions
  ): Promise<AIServiceResponse<ReceiptData>>;
  
  setConfig(config: AIModelConfig): void;
  getAvailableModels(): string[];
  
  // Method for generating content with text and image input
  generateContent(prompt: string, imageData: string | Blob): Promise<string>;
}
