
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useStore } from '@/hooks/useStore';
import { ExternalLink, Save, Store } from 'lucide-react';

const Settings = () => {
  const { currentStore, updateStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentStore?.name || '',
    description: currentStore?.description || '',
    is_active: currentStore?.is_active || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;
    
    setLoading(true);
    try {
      await updateStore(currentStore.id, formData);
    } catch (error) {
      // Error handled in useStore
    } finally {
      setLoading(false);
    }
  };

  const visitStore = () => {
    if (currentStore) {
      const storeUrl = `${window.location.origin}/store/${currentStore.slug}`;
      window.open(storeUrl, '_blank');
    }
  };

  const getStoreUrl = () => {
    if (currentStore) {
      return `${window.location.origin}/store/${currentStore.slug}`;
    }
    return '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
            <p className="text-muted-foreground">
              Manage your store configuration and preferences
            </p>
          </div>
          {currentStore && (
            <Button onClick={visitStore} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Visit Store
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          {/* Store URL Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store URL
              </CardTitle>
              <CardDescription>
                Your public store URL where customers can visit and shop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <code className="text-sm font-mono flex-1">{getStoreUrl()}</code>
                <Button variant="outline" size="sm" onClick={visitStore}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this URL with your customers so they can visit your store and make purchases.
              </p>
            </CardContent>
          </Card>

          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your store's basic information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Store Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Awesome Store"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell customers about your store..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Store is active and visible to customers</Label>
                </div>

                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Store Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Store Performance</CardTitle>
              <CardDescription>
                Quick overview of your store's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$0.00</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Active Products</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
