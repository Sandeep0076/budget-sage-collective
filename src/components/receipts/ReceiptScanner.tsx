/**
 * Receipt Scanner Component
 * 
 * Handles receipt image upload, AI processing, and transaction creation.
 * Uses the AI service to extract structured data from receipt images.
 */

import React, { useState, useRef } from 'react';
import { useAI } from '@/context/AIProvider';
import { ReceiptData, ReceiptItem } from '@/services/ai/types';
import { useCreateTransaction, useAIConfig } from '@/hooks/useSupabaseQueries';
import { Button } from '@/components/ui/button';
import CustomCard, { CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/CustomCard';
import { Card, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Camera, Upload, RefreshCw, Check, X, Settings, Image as ImageIcon } from 'lucide-react';
// Import directly with file extension
import AIConfigPanel from './AIConfigPanel.tsx';

const ReceiptScanner: React.FC = () => {
  const { service, isConfigured } = useAI();
  const createTransactionMutation = useCreateTransaction();
  const { data: savedConfig, isLoading: isLoadingConfig } = useAIConfig();
  
  // State for image upload and processing
  const [imageSource, setImageSource] = useState<'upload' | 'camera'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // State for extracted receipt data
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Refs for file input and camera
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setReceiptData(null);
    }
  };
  
  // Handle camera capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  };
  
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        
        // Convert data URL to file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
            setImageFile(file);
          }
        }, 'image/jpeg');
        
        // Stop camera after capture
        stopCamera();
        setReceiptData(null);
      }
    }
  };
  
  // Process receipt image with AI
  const processReceipt = async () => {
    if (!service || !imageFile) {
      toast.error('Please configure AI service and upload an image first');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        // Process with AI service
        const response = await service.processReceiptImage(base64Image);
        
        if (response.error) {
          toast.error(`Error processing receipt: ${response.error}`);
        } else if (response.data) {
          setReceiptData(response.data);
          toast.success('Receipt processed successfully');
        } else {
          toast.error('Failed to extract data from receipt');
        }
        
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error('Error processing receipt');
      setIsProcessing(false);
    }
  };
  
  // Create transaction from receipt data
  const createTransaction = async () => {
    if (!receiptData) return;
    
    try {
      await createTransactionMutation.mutateAsync({
        description: `${receiptData.merchant}`,
        amount: receiptData.total,
        transaction_date: receiptData.date,
        category_id: null, // We'll need to map category names to IDs in a real implementation
        transaction_type: 'expense',
        notes: `Receipt items: ${receiptData.items.map(item => item.name).join(', ')}`
      });
      
      toast.success('Transaction created successfully');
      
      // Reset form
      setImageFile(null);
      setImagePreview(null);
      setReceiptData(null);
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Error creating transaction');
    }
  };
  
  // Reset the form
  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setReceiptData(null);
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Update receipt data field
  const updateReceiptData = (field: keyof ReceiptData, value: any) => {
    if (receiptData) {
      setReceiptData({
        ...receiptData,
        [field]: value
      });
    }
  };
  
  // Update receipt item
  const updateReceiptItem = (index: number, field: keyof ReceiptItem, value: any) => {
    if (receiptData && receiptData.items) {
      const updatedItems = [...receiptData.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'price' || field === 'quantity' ? Number(value) : value
      };
      
      setReceiptData({
        ...receiptData,
        items: updatedItems
      });
    }
  };
  
  // Clean up camera on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <CustomCard gradient hover className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Scan Receipt</span>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="bg-background/40 hover:bg-background/60 border-white/30"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </CardTitle>
          <p className="text-sm text-white/70">
            Upload or take a photo of your receipt to extract information
          </p>
        </CardHeader>
        <CardContent>
          {!isConfigured && (
            <div className="mb-6 p-4 border border-yellow-500/50 rounded-lg bg-yellow-500/10">
              <p className="text-sm text-white flex items-center gap-2">
                <Settings className="h-4 w-4" />
                AI configuration is required. Please check settings.
              </p>
            </div>
          )}
          
          {/* Show settings panel if settings button is clicked OR if AI is not configured and there's no saved config */}
          {(showSettings || (!isConfigured && !isLoadingConfig && !savedConfig)) && (
            <div className="mb-6">
              <AIConfigPanel />
              <Separator className="my-4" />
            </div>
          )}
          
          <Tabs 
            defaultValue="upload" 
            value={imageSource}
            onValueChange={(value) => {
              setImageSource(value as 'upload' | 'camera');
              if (value === 'camera') {
                startCamera();
              } else {
                stopCamera();
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="camera">Camera</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div 
                className="flex flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-lg p-6 cursor-pointer bg-background/20 hover:bg-background/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {!imagePreview ? (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-white/70" />
                    <p className="mt-2 text-sm text-white/70">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-white/70">
                      PNG, JPG or JPEG
                    </p>
                  </div>
                ) : (
                  <div className="relative w-full">
                    <img 
                      src={imagePreview} 
                      alt="Receipt preview" 
                      className="max-h-[400px] mx-auto object-contain rounded-md"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/40 hover:bg-background/60 border-white/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetForm();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="camera" className="space-y-4">
              <div className="relative border border-white/30 rounded-lg overflow-hidden bg-background/20">
                {cameraStream ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      className="w-full h-[400px] object-cover"
                    />
                    <Button
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary/70 hover:bg-primary/90"
                      onClick={captureImage}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                  </>
                ) : imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Receipt preview" 
                      className="max-h-[400px] w-full object-contain"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/40 hover:bg-background/60 border-white/30"
                      onClick={() => resetForm()}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 h-[300px]">
                    <ImageIcon className="h-12 w-12 text-white/70" />
                    <p className="mt-2 text-white/70">
                      Camera preview will appear here
                    </p>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={resetForm}
            className="bg-background/40 hover:bg-background/60 border-white/30"
          >
            Reset
          </Button>
          <Button 
            onClick={processReceipt} 
            disabled={!imageFile || isProcessing}
            className="bg-primary/70 hover:bg-primary/90"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Process Receipt
              </>
            )}
          </Button>
        </CardFooter>
      </CustomCard>
      
      {receiptData && (
        <CustomCard gradient hover className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Extracted Receipt Data</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-background/40 hover:bg-background/60 border-white/30"
              >
                {isEditing ? 'View' : 'Edit'}
              </Button>
            </CardTitle>
            <p className="text-sm text-white/70">
              Review and edit the extracted information before creating a transaction
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="merchant">Merchant</Label>
                  {isEditing ? (
                    <Input
                      id="merchant"
                      value={receiptData.merchant}
                      onChange={(e) => updateReceiptData('merchant', e.target.value)}
                      className="bg-background/40 border-white/30"
                    />
                  ) : (
                    <div className="p-2 border border-white/30 rounded-md bg-background/20">{receiptData.merchant}</div>
                  )}
                </div>
                    
                    <div>
                      <Label htmlFor="date">Date</Label>
                      {isEditing ? (
                        <Input
                          id="date"
                          type="date"
                          value={receiptData.date}
                          onChange={(e) => updateReceiptData('date', e.target.value)}
                          className="bg-background/40 border-white/30"
                        />
                      ) : (
                        <div className="p-2 border border-white/30 rounded-md bg-background/20">
                          {new Date(receiptData.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="total">Total Amount</Label>
                      {isEditing ? (
                        <Input
                          id="total"
                          type="number"
                          step="0.01"
                          value={receiptData.total}
                          onChange={(e) => updateReceiptData('total', parseFloat(e.target.value))}
                          className="bg-background/40 border-white/30"
                        />
                      ) : (
                        <div className="p-2 border border-white/30 rounded-md bg-background/20">
                          ${receiptData.total.toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      {isEditing ? (
                        <Select
                          value={receiptData.category || 'Other'}
                          onValueChange={(value) => updateReceiptData('category', value)}
                        >
                          <SelectTrigger className="bg-background/40 border-white/30">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Groceries">Groceries</SelectItem>
                            <SelectItem value="Dining">Dining</SelectItem>
                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                            <SelectItem value="Shopping">Shopping</SelectItem>
                            <SelectItem value="Transportation">Transportation</SelectItem>
                            <SelectItem value="Utilities">Utilities</SelectItem>
                            <SelectItem value="Housing">Housing</SelectItem>
                            <SelectItem value="Health">Health</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 border border-white/30 rounded-md bg-background/20">
                          {receiptData.category || 'Other'}
                        </div>
                      )}
                    </div>
                    
                    {receiptData.taxAmount !== undefined && (
                      <div>
                        <Label htmlFor="tax">Tax Amount</Label>
                        {isEditing ? (
                          <Input
                            id="tax"
                            type="number"
                            step="0.01"
                            value={receiptData.taxAmount}
                            onChange={(e) => updateReceiptData('taxAmount', parseFloat(e.target.value))}
                            className="bg-background/40 border-white/30"
                          />
                        ) : (
                          <div className="p-2 border border-white/30 rounded-md bg-background/20">
                            ${receiptData.taxAmount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {receiptData.tipAmount !== undefined && (
                      <div>
                        <Label htmlFor="tip">Tip Amount</Label>
                        {isEditing ? (
                          <Input
                            id="tip"
                            type="number"
                            step="0.01"
                            value={receiptData.tipAmount}
                            onChange={(e) => updateReceiptData('tipAmount', parseFloat(e.target.value))}
                            className="bg-background/40 border-white/30"
                          />
                        ) : (
                          <div className="p-2 border border-white/30 rounded-md bg-background/20">
                            ${receiptData.tipAmount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {receiptData.paymentMethod && (
                      <div>
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        {isEditing ? (
                          <Input
                            id="paymentMethod"
                            value={receiptData.paymentMethod}
                            onChange={(e) => updateReceiptData('paymentMethod', e.target.value)}
                            className="bg-background/40 border-white/30"
                          />
                        ) : (
                          <div className="p-2 border border-white/30 rounded-md bg-background/20">
                            {receiptData.paymentMethod}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Items</h3>
                    <div className="border border-white/30 rounded-md overflow-hidden bg-background/20">
                      <table className="w-full">
                        <thead className="bg-background/40">
                          <tr>
                            <th className="p-2 text-left">Item</th>
                            <th className="p-2 text-right">Price</th>
                            <th className="p-2 text-right">Qty</th>
                            <th className="p-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receiptData.items.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">
                                {isEditing ? (
                                  <Input
                                    value={item.name}
                                    onChange={(e) => updateReceiptItem(index, 'name', e.target.value)}
                                    className="bg-background/40 border-white/30"
                                  />
                                ) : (
                                  item.name
                                )}
                              </td>
                              <td className="p-2 text-right">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.price}
                                    onChange={(e) => updateReceiptItem(index, 'price', parseFloat(e.target.value))}
                                    className="w-24 ml-auto bg-background/40 border-white/30"
                                  />
                                ) : (
                                  `$${item.price.toFixed(2)}`
                                )}
                              </td>
                              <td className="p-2 text-right">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={item.quantity || 1}
                                    onChange={(e) => updateReceiptItem(index, 'quantity', parseInt(e.target.value))}
                                    className="w-16 ml-auto bg-background/40 border-white/30"
                                  />
                                ) : (
                                  item.quantity || 1
                                )}
                              </td>
                              <td className="p-2 text-right">
                                ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={createTransaction} className="bg-primary/70 hover:bg-primary/90">
              <Check className="mr-2 h-4 w-4" />
              Create Transaction
            </Button>
          </CardFooter>
        </CustomCard>
      )}
    </div>
  );
};

export default ReceiptScanner;
