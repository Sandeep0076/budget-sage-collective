
/**
 * ReceiptScanner Component
 * 
 * Allows users to scan receipts using their camera or upload receipt images.
 * Extracts transaction information using AI and allows editing before saving.
 */

import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAI } from '@/context/AIProvider';
import AIConfigPanel from './AIConfigPanel';
import ReceiptDataEditor from './ReceiptDataEditor';
import { useCreateTransaction } from '@/hooks/useSupabaseQueries';

export interface ReceiptData {
  description: string;
  amount: number;
  date: string;
  category?: string;
  notes?: string;
}

const ReceiptScanner = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { service, isConfigured } = useAI();
  const createTransaction = useCreateTransaction();

  // Function to start camera capture
  const startCamera = async () => {
    try {
      setError(null);
      setIsCapturing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
      setIsCapturing(false);
    }
  };
  
  // Function to stop camera capture
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };
  
  // Function to capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to image data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setImage(imageDataUrl);
        
        // Stop camera after capture
        stopCamera();
      }
    }
  };
  
  // Function to handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Function to handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Function to extract data from receipt image
  const extractDataFromReceipt = async () => {
    if (!image) {
      toast.error('No image to process');
      return;
    }
    
    if (!service || !isConfigured) {
      toast.error('AI service not configured', {
        description: 'Please configure your AI service first'
      });
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const prompt = `
        Extract the following information from this receipt image:
        1. Store/merchant name or transaction description
        2. Total amount (just the number)
        3. Date of purchase (in YYYY-MM-DD format if possible)
        4. Any category information (e.g., groceries, restaurant, etc.)
        5. Any additional notes or details

        If any text is in German, please translate it to English first.
        
        Format your response as JSON with these fields:
        {
          "description": "string",
          "amount": number,
          "date": "string",
          "category": "string",
          "notes": "string"
        }
      `;
      
      // Use the generateContent method instead of generateText (which doesn't exist)
      const response = await service.generateContent(prompt, image);
      console.log('AI response:', response);
      
      // Try to parse the response as JSON
      try {
        // Extract JSON from the response if it contains other text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        
        const parsedData = JSON.parse(jsonString);
        
        // Validate the parsed data has the required fields
        if (!parsedData.description || parsedData.amount === undefined) {
          throw new Error('Missing required fields in the extracted data');
        }
        
        // Set default date to today if not extracted
        if (!parsedData.date) {
          parsedData.date = new Date().toISOString().split('T')[0];
        }
        
        setExtractedData(parsedData);
      } catch (err) {
        console.error('Error parsing JSON response:', err);
        toast.error('Could not parse the extracted data');
        setError('The AI service did not return valid data. Please try again or upload a clearer image.');
      }
    } catch (err) {
      console.error('Error processing receipt:', err);
      setError('Error processing receipt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to reset the scanner
  const resetScanner = () => {
    setImage(null);
    setExtractedData(null);
    setError(null);
    setIsProcessing(false);
  };
  
  // Function to save transaction data
  const saveTransaction = (data: ReceiptData) => {
    createTransaction.mutate({
      description: data.description,
      amount: data.amount,
      transaction_date: data.date,
      transaction_type: 'expense',
      notes: data.notes || undefined,
      // Could add category mapping here if we had a way to map text categories to IDs
    }, {
      onSuccess: () => {
        toast.success('Transaction saved successfully');
        resetScanner();
      },
      onError: (err) => {
        console.error('Error saving transaction:', err);
        toast.error('Failed to save transaction');
      }
    });
  };
  
  return (
    <div className="space-y-6">
      {/* AI Configuration Panel */}
      <AIConfigPanel />
      
      {/* Camera and Upload Section */}
      <Card className="overflow-hidden gradient-bg">
        <CardContent className="p-6">
          {!isConfigured ? (
            <div className="text-center py-10">
              <AlertCircle className="mx-auto h-10 w-10 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Service Not Configured</h3>
              <p className="text-muted-foreground mb-4">
                Please configure your AI service above to enable receipt scanning.
              </p>
            </div>
          ) : image ? (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={image} alt="Receipt" className="w-full object-contain max-h-[400px]" />
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {!isProcessing && !extractedData && (
                  <Button onClick={extractDataFromReceipt} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Extract Data'
                    )}
                  </Button>
                )}
                
                <Button variant="outline" onClick={resetScanner}>
                  Take New Photo
                </Button>
              </div>
              
              {isProcessing && (
                <div className="text-center p-4">
                  <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-2" />
                  <p>Processing receipt...</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
            </div>
          ) : isCapturing ? (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-border">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-[400px] object-cover"
                />
              </div>
              
              <div className="flex justify-center gap-2">
                <Button onClick={captureImage}>Capture</Button>
                <Button variant="outline" onClick={stopCamera}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={startCamera}
                className="h-auto py-8 flex flex-col"
                variant="outline"
              >
                <Camera className="h-10 w-10 mb-2" />
                <span className="text-lg font-medium">Take Photo</span>
                <span className="text-sm text-muted-foreground mt-1">
                  Use your camera to capture receipt
                </span>
              </Button>
              
              <Button 
                onClick={handleUploadClick}
                className="h-auto py-8 flex flex-col"
                variant="outline"
              >
                <Upload className="h-10 w-10 mb-2" />
                <span className="text-lg font-medium">Upload Receipt</span>
                <span className="text-sm text-muted-foreground mt-1">
                  Select a receipt image file
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Data Editor */}
      {extractedData && (
        <ReceiptDataEditor 
          receiptData={extractedData} 
          onSave={saveTransaction}
          onCancel={resetScanner}
        />
      )}
      
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ReceiptScanner;
