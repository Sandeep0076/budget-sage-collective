/**
 * AI Configuration Panel
 * 
 * Component for configuring AI service settings including
 * provider selection, API key management, and model selection.
 */

import React, { useState, useRef } from 'react';
import { useAI } from '@/context/AIProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomCard, { CardContent } from '@/components/ui/CustomCard';
import { Eye, EyeOff, Save, X, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { testApiKey } from '@/services/ai/apiTester';

const AIConfigPanel: React.FC = () => {
  const { 
    provider, 
    config, 
    setProvider, 
    setApiKey, 
    setModelName,
    availableProviders,
    availableModels,
    isConfigured
  } = useAI();
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(config.apiKey);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [testingApi, setTestingApi] = useState(false);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);
  
  const handleSaveApiKey = () => {
    // Basic validation for API key format
    if (!tempApiKey || tempApiKey.trim() === '') {
      setApiKeyError('API key cannot be empty');
      return;
    }
    
    // Clear any previous errors
    setApiKeyError(null);
    
    // Log for debugging
    console.log('Saving API key:', tempApiKey.trim().substring(0, 5) + '...');
    
    // Save the API key
    setApiKey(tempApiKey.trim());
    toast.success('API key saved successfully');
  };
  
  const handleClearApiKey = () => {
    setTempApiKey('');
    setApiKeyError(null);
    if (apiKeyInputRef.current) {
      apiKeyInputRef.current.focus();
    }
  };
  
  const handleTestApiKey = async () => {
    if (!tempApiKey || tempApiKey.trim() === '') {
      setApiKeyError('API key cannot be empty');
      return;
    }
    
    setTestingApi(true);
    
    try {
      const result = await testApiKey(provider, tempApiKey.trim());
      
      if (result.success) {
        toast.success(result.message);
        
        // If the test was successful, also save the API key
        setApiKey(tempApiKey.trim());
      } else {
        toast.error(result.message);
        setApiKeyError('API key validation failed');
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      toast.error('An error occurred while testing the API key');
      setApiKeyError('API test failed');
    } finally {
      setTestingApi(false);
    }
  };
  
  // We've simplified the UI and removed the clipboard button
  
  const getProviderLabel = (provider: string): string => {
    switch (provider) {
      case 'gemini':
        return 'Google Gemini (Direct)';
      case 'gemini-langchain':
        return 'Google Gemini (LangChain)';
      case 'openai':
        return 'OpenAI';
      case 'anthropic':
        return 'Anthropic';
      default:
        return provider;
    }
  };
  
  return (
    <CustomCard gradient hover className="glass-effect">
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ai-provider">AI Provider</Label>
          <Select
            value={provider}
            onValueChange={(value: any) => setProvider(value)}
          >
            <SelectTrigger id="ai-provider" className="bg-background/40 border-white/30">
              <SelectValue placeholder="Select AI provider" />
            </SelectTrigger>
            <SelectContent>
              {availableProviders.map((p) => (
                <SelectItem key={p} value={p}>
                  {getProviderLabel(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {(provider === 'gemini' || provider === 'gemini-langchain') && (
              <>
                Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">Google AI Studio</a>. 
                Make sure to create an API key with access to the Gemini models.
              </>
            )}
            {provider === 'openai' && (
              <>
                Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">OpenAI platform</a>.
              </>
            )}
            {provider === 'anthropic' && (
              <>
                Get your API key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">Anthropic console</a>.
              </>
            )}
          </p>
        </div>
        
        <div>
          <Label htmlFor="api-key">API Key</Label>
          <div className="space-y-4">
            {/* Simple text input for API key */}
            <div className="relative">
              <Input
                id="api-key"
                ref={apiKeyInputRef}
                type={showApiKey ? 'text' : 'password'}
                value={tempApiKey}
                onChange={(e) => {
                  setTempApiKey(e.target.value);
                  setApiKeyError(null); // Clear error on change
                }}
                onPaste={(e) => {
                  console.log('Paste event detected');
                }}
                placeholder="Enter your API key"
                className={`bg-background/40 border-white/30 ${apiKeyError ? 'border-red-500' : ''}`}
              />
              <div className="absolute right-0 top-0 h-full flex">
                {tempApiKey && (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="h-full"
                    onClick={handleClearApiKey}
                    title="Clear API key"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="h-full"
                  onClick={() => setShowApiKey(!showApiKey)}
                  title={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {/* Current saved API key display */}
            {config.apiKey && (
              <div className="text-xs text-green-500 font-medium">
                <CheckCircle2 className="h-3 w-3 inline mr-1" /> 
                API key is saved and active
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex space-x-2">
              <Button 
                onClick={handleSaveApiKey} 
                className="flex-1"
                disabled={!tempApiKey || tempApiKey === config.apiKey}
              >
                <Save className="h-4 w-4 mr-2" />
                Save API Key
              </Button>
              <Button 
                onClick={handleTestApiKey} 
                variant="outline" 
                className="flex-1"
                disabled={!tempApiKey || testingApi}
              >
                {testingApi ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⟳</span> Testing
                  </span>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Error message */}
          {apiKeyError && (
            <p className="text-xs text-red-500 mt-1">{apiKeyError}</p>
          )}
          
          {/* Help text */}
          <p className="text-xs text-muted-foreground mt-4">
            Enter your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">Google AI Studio</a>.
            Your API key will be saved securely and persisted between sessions.
          </p>
        </div>
        
        <div>
          <Label htmlFor="model">Model</Label>
          <Select
            value={config.modelName}
            onValueChange={setModelName}
            disabled={!isConfigured}
          >
            <SelectTrigger id="model" className="bg-background/40 border-white/30">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {provider === 'gemini' && 'Gemini 2.0 Flash is recommended for receipt scanning'}
          </p>
        </div>
      </CardContent>
    </CustomCard>
  );
};

export default AIConfigPanel;
