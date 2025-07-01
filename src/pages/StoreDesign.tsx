
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Upload, Eye } from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const StoreDesign = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch current store data
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: store, error } = await supabase
          .from('stores')
          .select('logo_url, banner_url')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (store) {
          setLogoUrl(store.logo_url);
          setBannerUrl(store.banner_url);
        }
      } catch (error: any) {
        console.error('Error fetching store data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load store data'
        });
      }
    };

    fetchStoreData();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('stores')
        .update({
          logo_url: logoUrl,
          banner_url: bannerUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Store design updated successfully'
      });
    } catch (error: any) {
      console.error('Error saving store data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save changes'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLogoUrl(null);
    setBannerUrl(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Store Design</h1>
            <p className="text-muted-foreground">
              Customize your store's appearance and branding
            </p>
          </div>
          <Button>
            <Eye className="h-4 w-4 mr-2" />
            Preview Store
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Theme Settings
              </CardTitle>
              <CardDescription>
                Customize colors and typography for your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input type="color" className="w-16 h-10" defaultValue="#3b82f6" />
                  <Input placeholder="#3b82f6" defaultValue="#3b82f6" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input type="color" className="w-16 h-10" defaultValue="#64748b" />
                  <Input placeholder="#64748b" defaultValue="#64748b" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Family</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                  <option>Lato</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Brand Assets
              </CardTitle>
              <CardDescription>
                Upload your logo and banner images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Store Logo</Label>
                <ImageUploader
                  label="Click to upload logo"
                  acceptedFileTypes={['image/png', 'image/jpeg', 'image/jpg']}
                  maxSize={2 * 1024 * 1024}
                  filePathPrefix="logos/"
                  onUpload={setLogoUrl}
                  currentImageUrl={logoUrl}
                />
              </div>

              <div className="space-y-2">
                <Label>Banner Image</Label>
                <ImageUploader
                  label="Click to upload banner"
                  acceptedFileTypes={['image/png', 'image/jpeg', 'image/jpg']}
                  maxSize={5 * 1024 * 1024}
                  filePathPrefix="banners/"
                  onUpload={setBannerUrl}
                  currentImageUrl={bannerUrl}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input placeholder="My Awesome Store" />
                </div>
                <div className="space-y-2">
                  <Label>Store Tagline</Label>
                  <Input placeholder="Quality products for everyone" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Store Description</Label>
                <Textarea placeholder="Tell customers about your store..." rows={4} />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StoreDesign;
