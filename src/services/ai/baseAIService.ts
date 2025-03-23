/**
 * Base AI Service
 * 
 * Abstract base class for AI service implementations that provides
 * common functionality and enforces the AIService interface.
 */

import { AIModelConfig, AIService, AIServiceOptions, AIServiceResponse, ReceiptData } from './types';

export abstract class BaseAIService implements AIService {
  protected config: AIModelConfig;
  
  constructor(config: AIModelConfig) {
    this.config = config;
  }
  
  abstract processReceiptImage(
    imageData: string | Blob, 
    options?: AIServiceOptions
  ): Promise<AIServiceResponse<ReceiptData>>;
  
  setConfig(config: AIModelConfig): void {
    this.config = config;
  }
  
  abstract getAvailableModels(): string[];
  
  protected handleError(error: any): AIServiceResponse<any> {
    console.error('AI Service Error:', error);
    return {
      data: null,
      error: error.message || 'An unknown error occurred',
      raw: error
    };
  }
}
