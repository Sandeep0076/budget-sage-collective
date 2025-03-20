
/**
 * Settings Page
 * 
 * Allows users to customize application settings including
 * profile information, notification preferences, appearance,
 * and account management options.
 */

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useProfile } from '@/hooks/useSupabaseQueries';
import AppLayout from '@/components/layout/AppLayout';
import CustomCard, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/CustomCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    currency: 'USD'
  });
  
  // Update form data when profile is loaded
  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email,
        currency: profile.currency || 'USD'
      });
    }
  }, [profile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({ ...prev, currency: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          currency: formData.currency
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      toast({
        title: 'Settings updated',
        description: 'Your profile settings have been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'CAD', name: 'Canadian Dollar (CA$)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' }
  ];
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-32 bg-muted rounded"></div>
          <div className="h-10 w-full bg-muted rounded"></div>
          <div className="grid gap-6">
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <CustomCard>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed directly. Contact support if you need to update it.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Save Changes</Button>
                </CardFooter>
              </form>
            </CustomCard>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4 mt-4">
            <CustomCard>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>App Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={handleCurrencyChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Save Preferences</Button>
                </CardFooter>
              </form>
            </CustomCard>
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4 mt-4">
            <CustomCard>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Change your account password
                  </p>
                  <Button variant="outline" className="mt-2">
                    Change Password
                  </Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. 
                    This action cannot be undone.
                  </p>
                  <Button variant="destructive" className="mt-2">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </CardFooter>
            </CustomCard>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
