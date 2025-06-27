'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus } from 'lucide-react';

export function AddLocationForm() {
  const router = useRouter();
  const [newLocation, setNewLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddLocation = async () => {
    if (newLocation.trim()) {
      setIsLoading(true);
      // TODO: API call to create location
      console.log('Creating location:', newLocation.trim());
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsLoading(false);
      router.push('/welcome');
    }
  };

  return (
    <div className="container mx-auto max-w-md py-8">
      <header className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="ml-4 text-2xl font-bold">Add New Location</h1>
      </header>
      <div className="space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="location-name">Location Name</Label>
          <div className="flex items-center space-x-2">
            <Plus className="text-muted-foreground" />
            <Input
              id="location-name"
              placeholder="Enter new location name"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={handleAddLocation}
          disabled={!newLocation.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? 'Adding...' : 'Add Location'}
        </Button>
      </div>
    </div>
  );
}
