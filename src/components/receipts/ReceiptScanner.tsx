
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
import { useCreateTransaction, useCategories } from '@/hooks/useSupabaseQueries'; // Import useCategories
import { ReceiptData, ReceiptItem } from '@/services/ai/types';

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
  const { data: categories, isLoading: isLoadingCategories } = useCategories(); // Fetch categories

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
      const categoryOptions = [
        "Food", "Entertainment", "Housing", "Utilities", "Insurance",
        "Transportation", "Healthcare","Savings", "Personal","Clothing","Others"
      ];
      
      const prompt = `
        Analyze this receipt image thoroughly. Extract the following details:

        1. Individual Items: A list of all items purchased. For EACH item, provide:
           - Description: The name of the item (translate to English if necessary).
           - Amount: The price of the single item or the total price for the quantity of that item (numeric value only).
           - category: Assign ONE category from the following list that best fits the item: ${categoryOptions.join(', ')}. Be specific for each item.
        2. Date: The date of the transaction. Use YYYY-MM-DD format if possible. If the date is not visible or cannot be determined from the image, use today's date (YYYY-MM-DD).
        3. Type: By default, assume the transaction is an Expense.

        Format the entire response STRICTLY as a JSON array with the following structure. Do not include any text outside of this JSON array:

        Example:
        [
          {
            "description": "Pillow",
            "category": "Housing",
            "date": "2025-03-27",
            "amount": -20.00,
            "type": "Expense"
          },
          {
            "description": "Pizza",
            "category": "Food",
            "date": "2025-03-21",
            "amount": -10,
             "type": "Expense"
          }
        ]
      `;
      
      // Use the processReceiptImage method for better structured output
      try {
        // First try using the specialized receipt processor if available
        const result = await service.processReceiptImage(image, { prompt });
        
        if (result.data) {
          // Add default categories for items if missing
          const updatedData = {
            ...result.data,
            items: result.data.items.map(item => ({
              ...item,
              category: item.category || result.data.category || 'General Merchandise'
            }))
          };
          setExtractedData(updatedData);
        } else if (result.error) {
          // Fall back to using generateContent if there's an error with processReceiptImage
          console.log('Falling back to generateContent due to error:', result.error);
          await useGenerateContentMethod(prompt);
        }
      } catch (err) {
        console.log('processReceiptImage not implemented, falling back to generateContent');
        await useGenerateContentMethod(prompt);
      }
    } catch (err: any) {
      console.error('Error processing receipt:', err);
      if (err.message.includes('Gemini API error')) {
        setError('Error processing receipt: Gemini API is currently experiencing issues. Please try again later.');
      } else {
        setError('Error processing receipt. Please try again or upload a clearer image.');
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper function to use the generateContent method
  const useGenerateContentMethod = async (prompt: string) => {
    if (!service || !image) return;
    
    try {
      // Use the generateContent method
      const response = await service.generateContent(prompt, image);
      console.log('AI response:', response);
      
      // Try to parse the response as JSON
      try {
        // Remove markdown code fences if present
        let jsonString = response;
        
        // Handle markdown code blocks
        if (response.includes('```json')) {
          // More robust regex to handle the code blocks
          jsonString = response.replace(/```json\s*\n/g, '').replace(/\n```\s*$/g, '');
          
          // If the above didn't work, try a more aggressive approach
          if (jsonString.includes('```')) {
            // Extract everything between the first and last backtick groups
            const match = response.match(/```json\s*\n([\s\S]*?)\n```/);
            if (match && match[1]) {
              jsonString = match[1];
            } else {
              // If still not working, just remove all backticks
              jsonString = response.replace(/```json/g, '').replace(/```/g, '');
            }
          }
        }
        
        // Trim any extra whitespace
        jsonString = jsonString.trim();
        
        // Parse the JSON
        const parsedData = JSON.parse(jsonString);
        
        // Check if it's an array or single object
        const itemsArray = Array.isArray(parsedData) ? parsedData : [parsedData];

        // Set default date to today if not extracted
        // Add default values to ensure data integrity
        const today = new Date().toISOString().split('T')[0];
        
        // Transform the items into the expected ReceiptItem format
        const receiptItems = itemsArray.map(item => ({
          name: item.description || 'Unknown Item',
          price: Math.abs(item.amount) || 0,
          quantity: 1,
          category: item.category || 'General Merchandise'
        }));
        
        // Calculate total from all items
        const total = receiptItems.reduce((sum, item) => sum + item.price, 0);
        
        // Create properly structured ReceiptData object
        const receiptData: ReceiptData = {
          merchant: 'Receipt Scan',
          date: itemsArray[0]?.date || today,
          total: total,
          items: receiptItems,
          category: 'General Merchandise'
        };
        
        setExtractedData(receiptData);
      } catch (err) {
        console.error('Error parsing JSON response:', err);
        toast.error('Could not parse the extracted data');
        setError('The AI service did not return valid data. Please try again or upload a clearer image.');
      }
    }
     catch (err) {
      console.error('Error with generateContent:', err);
      throw err; // Re-throw to be caught by the parent
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
    if (isLoadingCategories || !categories) {
      toast.error("Categories still loading. Please wait and try again.");
      return;
    }

    // Create a map for quick category lookup by name (case-insensitive)
    const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]));
    const defaultCategoryName = 'General Merchandise';
    const defaultCategoryId = categoryMap.get(defaultCategoryName.toLowerCase());

    if (!defaultCategoryId) {
      console.error("Default category 'General Merchandise' not found in database.");
      toast.error("Configuration error: Default category missing.");
      return;
    }

    // Save each receipt item as an individual transaction
    const promises = data.items.map(item => {
      const itemCategoryName = item.category || data.category || defaultCategoryName;
      const categoryId = categoryMap.get(itemCategoryName.toLowerCase()) || defaultCategoryId;

      if (!categoryMap.has(itemCategoryName.toLowerCase())) {
        console.warn(`Category "${itemCategoryName}" not found. Using default.`);
      }

      return createTransaction.mutate({
        description: `${item.name} (${data.merchant || 'Unknown Merchant'})`,
        amount: item.price,
        transaction_date: data.date || new Date().toISOString().split('T')[0], // Ensure date is present
        transaction_type: 'expense',
        notes: `Part of receipt from ${data.merchant || 'Unknown Merchant'}. Total: ${data.total}`,
        category_id: categoryId, // Use category_id
      });
    });

    // Wait for all transactions to be created
    Promise.all(promises)
      .then(() => {
        toast.success(`${data.items.length} transactions saved successfully`);
        resetScanner();
      })
      .catch((err) => {
        console.error('Error saving transactions:', err);
        toast.error('Failed to save some transactions');
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
