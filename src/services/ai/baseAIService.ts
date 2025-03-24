
/**
 * Base AI Service Class
 * 
 * Abstract base class that implements common functionality for all AI services.
 * Provides error handling and configuration management.
 */

import { AIModelConfig, AIService, AIServiceResponse } from './types';

export abstract class BaseAIService implements AIService {
  protected config: AIModelConfig;
  
  constructor(config: AIModelConfig) {
    this.config = config;
  }
  
  abstract processReceiptImage(imageData: string | Blob, options?: any): Promise<AIServiceResponse<any>>;
  abstract getAvailableModels(): string[];
  abstract generateContent(prompt: string, imageData: string | Blob): Promise<string>;
  
  setConfig(config: AIModelConfig): void {
    this.config = config;
  }
  
  protected handleError(error: any): AIServiceResponse<any> {
    console.error('AI Service Error:', error);
    
    let errorMessage = 'An error occurred while processing your request.';
    
    if (error.response) {
      // API error with response
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 400) {
        errorMessage = 'Invalid request format. Please check your inputs.';
      } else if (status === 401) {
        errorMessage = 'Authentication error. Please check your API key.';
      } else if (status === 403) {
        errorMessage = 'Access forbidden. Your API key may not have permission for this operation.';
      } else if (status === 404) {
        errorMessage = 'Resource not found. The requested API endpoint may be incorrect.';
      } else if (status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (status >= 500) {
        errorMessage = 'Server error. The AI service may be experiencing issues.';
      }
      
      // Add specific error details if available
      if (data && data.error) {
        errorMessage += ` Details: ${data.error.message || JSON.stringify(data.error)}`;
      }
    } else if (error.request) {
      // Request made but no response received
      errorMessage = 'No response received from the AI service. Please check your internet connection.';
    } else if (error.message) {
      // Error setting up the request
      errorMessage = error.message;
    }
    
    return {
      data: null,
      error: errorMessage
    };
  }
}
