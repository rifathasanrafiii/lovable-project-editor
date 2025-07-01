
import React from 'react';
import { useStore } from '@/hooks/useStore';
import { CreateStoreDialog } from '@/components/stores/CreateStoreDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const GetStarted = () => {
  const { stores, loading } = useStore();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (stores.length > 0) {
    return null; // Redirect will happen in App.tsx
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-blue-100 p-6 rounded-full mb-6">
          <Store className="h-12 w-12 text-blue-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to StoreBuilder!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Create your first online store and start selling in minutes. 
          It's easy, fast, and powerful.
        </p>

        <Card className="w-full max-w-md mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRight className="h-5 w-5 mr-2 text-blue-600" />
              Quick Setup
            </CardTitle>
            <CardDescription>
              Get your store ready in 3 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Create your store</h4>
                  <p className="text-sm text-gray-600">Choose a name and customize your store</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Add products</h4>
                  <p className="text-sm text-gray-600">Upload your products with photos and descriptions</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Start selling</h4>
                  <p className="text-sm text-gray-600">Share your store and accept orders</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <CreateStoreDialog />
      </div>
    </DashboardLayout>
  );
};

export default GetStarted;
