import React, { useState } from 'react';
import { useTheme, gradientThemes } from '@/components/ui/theme-provider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Theme schema for custom colors
const themeSchema = z.object({
  startColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, {
    message: 'Please enter a valid hex color code (e.g., #0091FF)',
  }),
  endColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, {
    message: 'Please enter a valid hex color code (e.g., #006FE8)',
  }),
});

// Gradient preview component
const GradientPreview = ({ startColor, endColor }: { startColor: string; endColor: string }) => {
  return (
    <div 
      className="h-16 w-full rounded-md mb-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-200" 
      style={{ 
        background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    />
  );
};

const Theme = () => {
  const { theme, setTheme, gradientTheme, setGradientTheme, customColors, setCustomColors } = useTheme();
  const [selectedGradient, setSelectedGradient] = useState<string>(gradientTheme);
  
  const form = useForm<z.infer<typeof themeSchema>>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      startColor: customColors.startColor,
      endColor: customColors.endColor,
    },
  });

  // Update form when custom colors change
  React.useEffect(() => {
    if (gradientTheme === 'custom') {
      form.reset({
        startColor: customColors.startColor,
        endColor: customColors.endColor,
      });
    }
  }, [customColors, form, gradientTheme]);

  const handleGradientChange = (value: string) => {
    setSelectedGradient(value);
    
    if (value !== 'custom') {
      setGradientTheme(value as any);
      toast({
        title: 'Theme Updated',
        description: 'Your theme has been successfully updated.',
      });
    }
  };

  const onSubmit = (data: z.infer<typeof themeSchema>) => {
    setCustomColors({
      startColor: data.startColor,
      endColor: data.endColor,
    });
    setGradientTheme('custom');
    toast({
      title: 'Custom Theme Applied',
      description: 'Your custom theme has been successfully applied.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Theme Mode</h3>
        <p className="text-sm text-muted-foreground">
          Choose between light, dark, or system theme.
        </p>
        <div className="flex items-center space-x-4">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
            className="w-24"
          >
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
            className="w-24"
          >
            Dark
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            onClick={() => setTheme('system')}
            className="w-24"
          >
            System
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Color Theme</h3>
          <p className="text-sm text-muted-foreground">
            Choose a gradient color theme for your application.
          </p>
        </div>

        <RadioGroup 
          value={selectedGradient} 
          onValueChange={handleGradientChange}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2"
        >
          {Object.entries(gradientThemes).map(([name, colors]) => (
            <div key={name} className="flex items-start space-x-2 cursor-pointer" onClick={() => handleGradientChange(name)}>
              <RadioGroupItem value={name} id={`theme-${name}`} className="mt-2" />
              <div className="flex-1 w-full">
                <Label htmlFor={`theme-${name}`} className="font-medium capitalize cursor-pointer">
                  {name}
                </Label>
                <div className="w-full" onClick={(e) => { e.stopPropagation(); handleGradientChange(name); }}>
                  <GradientPreview startColor={colors.startColor} endColor={colors.endColor} />
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex items-start space-x-2 cursor-pointer" onClick={() => handleGradientChange('custom')}>
            <RadioGroupItem value="custom" id="theme-custom" className="mt-2" />
            <div className="flex-1 w-full">
              <Label htmlFor="theme-custom" className="font-medium capitalize cursor-pointer">
                Custom
              </Label>
              {selectedGradient === 'custom' ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Color</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input placeholder="#0091FF" {...field} />
                              </FormControl>
                              <div 
                                className="h-10 w-10 rounded-md border" 
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Color</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input placeholder="#006FE8" {...field} />
                              </FormControl>
                              <div 
                                className="h-10 w-10 rounded-md border" 
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <GradientPreview 
                      startColor={form.watch('startColor')} 
                      endColor={form.watch('endColor')} 
                    />
                    <Button type="submit">Apply Custom Theme</Button>
                  </form>
                </Form>
              ) : (
                <GradientPreview startColor="#0091FF" endColor="#006FE8" />
              )}
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Preview</h3>
        <p className="text-sm text-muted-foreground">
          This is how your theme will look across the application.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="rounded-lg overflow-hidden border shadow-sm">
            <div className="h-12 gradient-bg flex items-center px-4">
              <span className="text-white font-medium">Sidebar</span>
            </div>
            <div className="p-4 bg-background">
              <h4 className="font-medium">Main Content</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Text will appear like this in the main content area.
              </p>
              <div className="flex space-x-2 mt-4">
                <Button size="sm">Primary Button</Button>
                <Button size="sm" variant="outline">Secondary Button</Button>
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border shadow-sm glass-effect p-4">
            <h4 className="font-medium">Glass Card</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Cards with glassmorphism effect will look like this.
            </p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm font-medium">Balance</span>
              <span className="text-lg font-bold">$1,234.56</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Theme;
