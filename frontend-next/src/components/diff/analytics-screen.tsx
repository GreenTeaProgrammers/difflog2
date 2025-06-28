'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the chart
const mockData = [
  { date: '2024-01', value: 12 },
  { date: '2024-02', value: 19 },
  { date: '2024-03', value: 3 },
  { date: '2024-04', value: 5 },
  { date: '2024-05', value: 2 },
  { date: '2024-06', value: 3 },
];

const locations = ['books', 'kitchen', 'desk', 'store'];

export function AnalyticsScreen() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState('desk');

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="ml-4 text-xl font-semibold">Analytics</h1>
      </header>

      <main className="flex-1 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </main>

      <div className="border-t p-4">
        <p className="text-center font-semibold">Location</p>
        <div className="flex justify-center gap-2 pt-2">
            {locations.map(loc => (
                <Button key={loc} variant={selectedLocation === loc ? "default" : "outline"} onClick={() => setSelectedLocation(loc)}>
                    {loc}
                </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
