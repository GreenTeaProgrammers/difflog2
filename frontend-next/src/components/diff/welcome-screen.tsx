'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Info, BarChart, Camera, Home, LogOut, Menu, Send, X } from 'lucide-react';

// Mock data for now
const user = { username: 'Guest' };
const locations = ["books", "kitchen", "desk", "store"];

export function WelcomeScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('desk');

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you'd also toggle a class on the body
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`flex h-screen flex-col ${isDarkMode ? 'dark' : ''} bg-background text-foreground`}>
      {/* Header */}
      <header className="flex items-center justify-between border-b p-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Information</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <p>This is the Difflog app. Refactored with Next.js and shadcn/ui.</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">{user.username} | 2024 - {selectedLocation}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/analytics')}>
            <BarChart />
          </Button>
          <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Year View</h2>
          <p className="text-muted-foreground">(Content will be migrated here)</p>
        </div>
      </main>
      
      {/* Location Selector */}
      <div className="border-t p-4">
        <p className="text-center font-semibold">Location Selector (Horizontal Wheel)</p>
        <div className="flex justify-center gap-2 pt-2">
            {locations.map(loc => (
                <Button key={loc} variant={selectedLocation === loc ? "default" : "outline"} onClick={() => setSelectedLocation(loc)}>
                    {loc}
                </Button>
            ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="grid grid-cols-3 items-center border-t">
        <Button variant="ghost" className="flex flex-col h-16" onClick={() => router.push('/location')}>
          <Send />
          <span>Location</span>
        </Button>
        <Button variant="ghost" className="flex flex-col h-16" onClick={() => router.push('/camera')}>
          <Camera />
          <span>Camera</span>
        </Button>
        <Button variant="ghost" className="flex flex-col h-16" onClick={() => router.push('/welcome')}>
          <Home />
          <span>Home</span>
        </Button>
      </footer>
    </div>
  );
}
