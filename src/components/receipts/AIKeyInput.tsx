
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Clipboard } from 'lucide-react';

interface AIKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  placeholder?: string;
  onSave?: () => void;
  testConnection?: () => Promise<boolean>;
}

const AIKeyInput: React.FC<AIKeyInputProps> = ({ 
  apiKey, 
  setApiKey, 
  placeholder = "Enter your API key",
  onSave,
  testConnection
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setApiKey(text.trim());
        toast({
          title: "API Key Pasted",
          description: "API key has been pasted from clipboard"
        });
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      toast({
        title: "Clipboard Error",
        description: "Could not access clipboard. Please paste manually.",
        variant: "destructive"
      });
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey) {
      toast({
        title: "No API Key",
        description: "Please enter an API key first",
        variant: "destructive"
      });
      return;
    }

    if (testConnection) {
      setIsLoading(true);
      try {
        const success = await testConnection();
        if (success) {
          toast({
            title: "Connection Successful",
            description: "Your API key is working correctly",
          });
        } else {
          toast({
            title: "Connection Failed",
            description: "Your API key may be invalid or expired",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Connection Error",
          description: "An error occurred while testing the connection",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handlePasteFromClipboard}
          title="Paste from clipboard"
        >
          <Clipboard className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex space-x-2">
        {onSave && (
          <Button 
            type="button" 
            onClick={onSave}
            disabled={!apiKey || isLoading}
            className="flex-1"
          >
            Save API Key
          </Button>
        )}
        
        {testConnection && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={!apiKey || isLoading}
            className="flex-1"
          >
            Test Connection
          </Button>
        )}
      </div>
    </div>
  );
};

export default AIKeyInput;
