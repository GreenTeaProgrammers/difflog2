'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus } from 'lucide-react';

export function AddLocationForm() {
  const router = useRouter();
  const [newLocation, setNewLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useSWRConfig();

  const handleAddLocation = async () => {
    if (newLocation.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        const payload = {
          name: newLocation.trim(),
          description: description.trim() ? description.trim() : null,
        };
        const response = await fetch('/api/locations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to create location');
        }

        // Revalidate locations data after successful creation
        mutate('/api/locations');
        router.push('/welcome');
      } catch (error) {
        console.error(error);
        setError('ロケーションの作成に失敗しました。');
      } finally {
        setIsLoading(false);
      }
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
        {error && (
          <div className="rounded-md bg-red-100 p-3 text-center text-sm text-red-500">
            {error}
          </div>
        )}
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
        <div className="space-y-2">
          <Label htmlFor="location-description">Description</Label>
          <Input
            id="location-description"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
