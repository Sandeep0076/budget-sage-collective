import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Camera, Upload, Receipt, AlertCircle, Check } from 'lucide-react';
import AIConfigPanel from './AIConfigPanel';
import ReceiptDataEditor from './ReceiptDataEditor';
import { useAI } from '@/context/AIProvider';
import { toast } from 'sonner';
import { ReceiptData } from '@/services/ai/types';
import { useTransactions } from '@/hooks/useSupabaseQueries';
import { format } from 'date-fns';

const ReceiptScanner: React.FC = () => {
  const { service, isConfigured } = useAI();
  const [activeTab, setActiveTab] = useState<string>('camera');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { mutateAsync: addTransaction } = useTransactions().addTransaction;

  const startCamera = async () => {
    try {
      setError(null);
      setIsCapturing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied or not available. Try uploading an image instead.');
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setImage(imageDataUrl);
        
        stopCamera();
      }
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Failed to capture image. Please try again.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Please upload an image smaller than 5MB.');
      return;
    }
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!image || !service) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      
      const result = await service.processReceiptImage(image, {
        systemPrompt: `Extract information from this receipt image. 
        If the text is in German, translate it to English.
        Return the data in a structured format including merchant name, 
        date, total amount, and line items. If you can't read something clearly, 
        indicate that with "unclear" rather than guessing.`
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.data) {
        throw new Error('No data returned from AI service');
      }
      
      console.log('Extracted receipt data:', result.data);
      
      toast.success('Receipt processed successfully!', {
        description: `Merchant: ${result.data.merchant}, Total: $${result.data.total}`
      });
      
      setExtractedData(result.data);
      
    } catch (err: any) {
      console.error('Error processing receipt:', err);
      setError(`Failed to process receipt: ${err.message}`);
      toast.error('Failed to process receipt', {
        description: err.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTransaction = async (data: ReceiptData) => {
    try {
      const transaction = {
        description: `${data.merchant} - Receipt`,
        amount: data.total || 0,
        transaction_type: 'expense',
        transaction_date: data.date ? format(new Date(data.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        notes: data.items ? `Items: ${data.items.map(item => `${item.name} (${item.quantity || 1} x $${item.price})`).join(', ')}` : ''
      };

      await addTransaction(transaction);

      toast.success('Transaction saved successfully!', {
        action: {
          label: 'View All',
          onClick: () => window.location.href = '/transactions'
        }
      });

      setImage(null);
      setExtractedData(null);
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction', {
        description: error.message
      });
    }
  };

  const cancelImage = () => {
    setImage(null);
    setError(null);
    setExtractedData(null);
  };

  const handleTabChange = (value: string) => {
    if (activeTab === 'camera' && value !== 'camera') {
      stopCamera();
    }
    
    setActiveTab(value);
    
    if (value === 'camera') {
      startCamera();
    }
  };

  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {!isConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-500">API Key Required</h3>
              <p className="text-sm text-muted-foreground">
                To scan receipts, you need to configure an AI provider API key. Complete the setup below.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <AIConfigPanel />
      
      {isConfigured && !extractedData && (
        <Card className="glass-effect">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="camera">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Receipt
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="camera" className="space-y-4 min-h-[300px] bg-gradient-bg">
                {isCapturing && (
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/5] flex items-center justify-center">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      onClick={captureImage} 
                      size="icon" 
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 h-14 w-14 rounded-full bg-primary"
                    >
                      <Camera className="h-6 w-6" />
                    </Button>
                  </div>
                )}
                
                {!isCapturing && !image && (
                  <div className="h-64 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center p-4 bg-gradient-bg">
                    <Camera className="h-10 w-10 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-center">Camera is not active</p>
                    <Button onClick={startCamera} className="mt-4">
                      Start Camera
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4 min-h-[300px] bg-gradient-bg">
                {!image && (
                  <div 
                    className="h-64 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center p-4 cursor-pointer bg-gradient-bg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                    />
                    {isUploading ? (
                      <Spinner size="lg" />
                    ) : (
                      <>
                        <Receipt className="h-10 w-10 text-muted-foreground/50 mb-4" />
                        <p className="text-center text-muted-foreground mb-2">
                          Click to upload a receipt image
                        </p>
                        <p className="text-xs text-muted-foreground/70 text-center">
                          JPEG, PNG, or GIF up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                )}
              </TabsContent>
              
              {error && (
                <div className="bg-destructive/10 border border-destructive/50 p-3 rounded-md">
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                  </p>
                </div>
              )}
              
              {image && (
                <div className="space-y-4 bg-gradient-bg p-4 rounded-lg">
                  <div className="relative">
                    <img 
                      src={image} 
                      alt="Receipt" 
                      className="w-full rounded-lg border border-border"
                    />
                    <div className="absolute top-2 right-2">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8 rounded-full opacity-80"
                        onClick={cancelImage}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={cancelImage}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={processImage} 
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Spinner className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>Process Receipt</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {extractedData && (
        <div className="animate-fade-in">
          <ReceiptDataEditor 
            receiptData={extractedData}
            onSave={handleSaveTransaction}
            onCancel={cancelImage}
          />
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;
