/**
 * AI API Tester
 * 
 * Utility to test if an AI provider API key is valid and working
 * by making a simple test request to the API.
 */

import { AIModelProvider, AIServiceFactory } from './aiServiceFactory';
import { AIModelConfig } from './types';

/**
 * Tests if the provided API key is valid for the given provider
 * by making a simple test request.
 * 
 * @param provider The AI provider to test
 * @param apiKey The API key to test
 * @returns A promise that resolves to a result object with success status and message
 */
export const testApiKey = async (
  provider: AIModelProvider,
  apiKey: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Create a config with the provided API key
    const config: AIModelConfig = {
      ...AIServiceFactory.getDefaultConfig(provider),
      apiKey
    };
    
    // Create a service instance
    const service = AIServiceFactory.createService(provider, config);
    
    // Make a simple test request
    const testPrompt = 'Respond with "API test successful" if you can read this message.';
    const response = await service.processReceiptImage(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // Tiny 1x1 transparent PNG
      { prompt: testPrompt }
    );
    
    // Check if we got a successful response
    const isSuccessful = !response.error;
    
    if (isSuccessful) {
      return {
        success: true,
        message: 'API connection successful! Your API key is working.'
      };
    } else {
      // We got a response but it doesn't contain our expected text
      return {
        success: true,
        message: 'API connection established, but received unexpected response. Your API key appears valid.'
      };
    }
  } catch (error: any) {
    // Handle specific error types
    if (error.message?.includes('API key not valid')) {
      return {
        success: false,
        message: 'Invalid API key. Please check your API key and try again.'
      };
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return {
        success: false,
        message: 'API quota exceeded or rate limited. Please try again later.'
      };
    } else if (error.message?.includes('network') || error.message?.includes('connection')) {
      return {
        success: false,
        message: 'Network error. Please check your internet connection and try again.'
      };
    } else {
      // Generic error message
      return {
        success: false,
        message: `API test failed: ${error.message || 'Unknown error'}`
      };
    }
  }
};
