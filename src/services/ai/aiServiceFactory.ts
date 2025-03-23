/**
 * AI Service Factory
 * 
 * Factory pattern implementation for creating AI service instances
 * based on the selected model provider. Makes it easy to switch between
 * different AI models without changing client code.
 */

import { AIModelConfig, AIService } from './types';
import { GeminiAIService } from './geminiAIService';
import { DirectGeminiService } from './directGeminiService';
import { LangchainGeminiService } from './langchainGeminiService';

export type AIModelProvider = 'gemini-langchain' | 'gemini' | 'openai' | 'anthropic';

export class AIServiceFactory {
  static createService(provider: AIModelProvider, config: AIModelConfig): AIService {
    switch (provider) {
      case 'gemini':
        // Use the direct implementation which bypasses Langchain
        return new DirectGeminiService(config);
      case 'gemini-langchain':
        // Use the LangChain implementation for better image handling
        return new LangchainGeminiService(config);
      case 'openai':
        // For future implementation
        throw new Error('OpenAI service not yet implemented');
      case 'anthropic':
        // For future implementation
        throw new Error('Anthropic service not yet implemented');
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }
  
  static getDefaultConfig(provider: AIModelProvider): AIModelConfig {
    switch (provider) {
      case 'gemini':
        return {
          modelName: 'gemini-2.0-flash',
          apiKey: '',
          temperature: 0.2,
          maxTokens: 1024
        };
      case 'gemini-langchain':
        return {
          modelName: 'gemini-1.5-flash-002',
          apiKey: '',
          temperature: 0.2,
          maxTokens: 2048
        };
      case 'openai':
        return {
          modelName: 'gpt-4-vision-preview',
          apiKey: '',
          temperature: 0.2,
          maxTokens: 1024
        };
      case 'anthropic':
        return {
          modelName: 'claude-3-opus-20240229',
          apiKey: '',
          temperature: 0.2,
          maxTokens: 1024
        };
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }
  
  static getAvailableProviders(): AIModelProvider[] {
    return ['gemini-langchain', 'gemini', 'openai', 'anthropic'];
  }
}
