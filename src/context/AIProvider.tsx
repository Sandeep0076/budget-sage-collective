/**
 * AI Provider Context
 * 
 * Provides AI service configuration and instances to the application.
 * Manages API keys, selected models, and service instances.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIModelConfig, AIService } from '@/services/ai/types';
import { AIModelProvider, AIServiceFactory } from '@/services/ai/aiServiceFactory';
import { useAIConfig, useSaveAIConfig } from '@/hooks/useSupabaseQueries';
import { toast } from 'sonner';

interface AIContextType {
  provider: AIModelProvider;
  config: AIModelConfig;
  service: AIService | null;
  isConfigured: boolean;
  setProvider: (provider: AIModelProvider) => void;
  setApiKey: (apiKey: string) => void;
  setModelName: (modelName: string) => void;
  resetConfig: () => void;
  availableProviders: AIModelProvider[];
  availableModels: string[];
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<AIModelProvider>('gemini-langchain');
  const [config, setConfig] = useState<AIModelConfig>(AIServiceFactory.getDefaultConfig('gemini-langchain'));
  const [service, setService] = useState<AIService | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  
  // Get AI config from database
  const { data: savedConfig, isLoading } = useAIConfig();
  const saveAIConfig = useSaveAIConfig();
  
  // Try to load config from localStorage first
  useEffect(() => {
    if (!configLoaded) {
      try {
        const storedConfig = localStorage.getItem('ai_config');
        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          console.log('Found config in localStorage:', { 
            provider: parsedConfig.provider,
            modelName: parsedConfig.modelName,
            apiKeyExists: !!parsedConfig.apiKey
          });
          
          // Set provider from localStorage
          if (parsedConfig.provider) {
            setProvider(parsedConfig.provider as AIModelProvider);
          }
          
          // Get default config for the provider to ensure we have proper defaults
          const defaultConfig = AIServiceFactory.getDefaultConfig(
            parsedConfig.provider as AIModelProvider || 'gemini-langchain'
          );
          
          // Set config from localStorage with defaults
          setConfig({
            apiKey: parsedConfig.apiKey || '',
            modelName: parsedConfig.modelName || defaultConfig.modelName,
            temperature: defaultConfig.temperature || 0.2,
            maxTokens: defaultConfig.maxTokens || 1024
          });
          
          setConfigLoaded(true);
        }
      } catch (e) {
        console.error('Error loading config from localStorage:', e);
      }
    }
  }, [configLoaded]);
  
  // Load saved configuration from database
  useEffect(() => {
    if (!isLoading && savedConfig && !configLoaded) {
      console.log('Loading saved AI config from database:', savedConfig);
      setProvider(savedConfig.provider as AIModelProvider);
      
      // Get default config for the provider to ensure we have proper defaults
      const defaultConfig = AIServiceFactory.getDefaultConfig(savedConfig.provider as AIModelProvider);
      
      setConfig({
        apiKey: savedConfig.api_key,
        modelName: savedConfig.model_name,
        temperature: defaultConfig.temperature || 0.2,
        maxTokens: defaultConfig.maxTokens || 1024
      });
      setConfigLoaded(true);
    }
  }, [savedConfig, isLoading, configLoaded]);
  
  // Initialize or update service when provider or config changes
  useEffect(() => {
    console.log('Provider or config changed:', { provider, apiKey: config.apiKey ? 'exists' : 'missing' });
    try {
      if (config.apiKey) {
        console.log('Creating AI service with config:', { 
          provider, 
          modelName: config.modelName,
          apiKeyLength: config.apiKey.length
        });
        const newService = AIServiceFactory.createService(provider, config);
        setService(newService);
        console.log('AI service created successfully');
      } else {
        console.log('No API key available, setting service to null');
        setService(null);
      }
    } catch (error) {
      console.error('Error creating AI service:', error);
      setService(null);
    }
  }, [provider, config]);
  
  // Get available models for the current provider
  const availableModels = service?.getAvailableModels() || [];
  
  // Check if the service is properly configured
  const isConfigured = Boolean(service && config.apiKey);
  
  // Set API key and save to database with localStorage fallback
  const setApiKey = (apiKey: string) => {
    console.log('Setting API key', { 
      keyLength: apiKey.length,
      provider,
      modelName: config.modelName 
    });
    
    // Update local state first
    setConfig(prev => {
      console.log('Updating config with new API key');
      return { ...prev, apiKey };
    });
    
    // Always save to localStorage as a fallback
    try {
      localStorage.setItem('ai_config', JSON.stringify({
        provider,
        apiKey,
        modelName: config.modelName
      }));
      console.log('Saved config to localStorage');
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
    
    // Try to save to database
    if (apiKey) {
      console.log('Attempting to save API key to database...');
      saveAIConfig.mutate({
        provider,
        api_key: apiKey,
        model_name: config.modelName
      }, {
        onSuccess: (data) => {
          console.log('API key saved successfully to database:', data);
          toast.success('AI configuration saved');
          setConfigLoaded(true); // Mark as loaded after successful save
        },
        onError: (error) => {
          console.error('Error saving API key to database:', error);
          // Don't show error toast since we've saved to localStorage
          toast.success('API key saved locally');
          setConfigLoaded(true);
        }
      });
    } else {
      console.warn('Empty API key provided');
    }
  };
  
  // Set model name and save to database with localStorage fallback
  const setModelName = (modelName: string) => {
    setConfig(prev => ({ ...prev, modelName }));
    
    // Always save to localStorage as a fallback
    try {
      localStorage.setItem('ai_config', JSON.stringify({
        provider,
        apiKey: config.apiKey,
        modelName
      }));
      console.log('Saved model name to localStorage');
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
    
    // Save to database if we have an API key
    if (config.apiKey) {
      saveAIConfig.mutate({
        provider,
        api_key: config.apiKey,
        model_name: modelName
      }, {
        onError: (error) => {
          console.error('Error saving model name:', error);
          // Don't show error toast since we've saved to localStorage
        }
      });
    }
  };
  
  // Reset config to default
  const resetConfig = () => {
    setConfig(AIServiceFactory.getDefaultConfig(provider));
  };
  
  // Get available providers
  const availableProviders = AIServiceFactory.getAvailableProviders();
  
  // Update provider and save to database with localStorage fallback
  const handleSetProvider = (newProvider: AIModelProvider) => {
    setProvider(newProvider);
    const newConfig = AIServiceFactory.getDefaultConfig(newProvider);
    
    // If we have a saved API key, keep it when changing providers
    if (config.apiKey) {
      newConfig.apiKey = config.apiKey;
    }
    
    // Always save to localStorage as a fallback
    try {
      localStorage.setItem('ai_config', JSON.stringify({
        provider: newProvider,
        apiKey: config.apiKey,
        modelName: newConfig.modelName
      }));
      console.log('Saved provider change to localStorage');
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
    
    setConfig(newConfig);
    
    // If we have a saved API key, try to save to database
    if (config.apiKey) {
      // Save to database
      saveAIConfig.mutate({
        provider: newProvider,
        api_key: config.apiKey,
        model_name: newConfig.modelName
      }, {
        onError: (error) => {
          console.error('Error saving provider change:', error);
          // Don't show error toast since we've saved to localStorage
        }
      });
    }
  };
  
  const value = {
    provider,
    config,
    service,
    isConfigured,
    setProvider: handleSetProvider,
    setApiKey,
    setModelName,
    resetConfig,
    availableProviders,
    availableModels
  };
  
  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
