'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Info, BarChart, Camera, Home, LogOut, Menu, Send, X, ChevronLeft } from 'lucide-react';
import { useUserSettingsStore } from '@/store/user-settings';
import { apiClient } from '@/lib/api';


const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ColorBlock = ({ year, month, day }: { year: number, month: number, day: number }) => {
  // Mock color based on date. In real app, fetch data.
  const hash = (year + month + day) % 4;
  const colors = ['bg-gray-200 dark:bg-gray-700', 'bg-green-200 dark:bg-green-800', 'bg-green-400 dark:bg-green-600', 'bg-green-600 dark:bg-green-400'];
  return <div className={`aspect-square w-full rounded-sm ${colors[hash]}`} />;
};

const fetcher = (url: string): Promise<Location[]> => apiClient(url.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081', ''));

type Location = {
  id: number;
  name: string;
};

export function WelcomeScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const { isDarkMode, toggleDarkMode } = useUserSettingsStore();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
  const { data: locations, error: locationsError } = useSWR<Location[]>(`${apiUrl}/locations`, fetcher);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    if (locations && locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0].name);
    }
  }, [locations, selectedLocation]);
  const [currentView, setCurrentView] = useState('year');
  const [currentMonth, setCurrentMonth] = useState(months[0]);
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderMonthGridPreview = (month: string) => {
    const monthIndex = months.indexOf(month);
    const daysInMonth = new Date(2024, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(2024, monthIndex, 1).getDay();

    return (
      <>
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, day) => (
          <ColorBlock key={day} year={2024} month={monthIndex + 1} day={day + 1} />
        ))}
      </>
    );
  };

  const renderYearView = () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {months.map((month) => (
        <div
          key={month}
          className="cursor-pointer rounded-lg border bg-card p-2 text-card-foreground shadow-sm"
          onClick={() => {
            setCurrentMonth(month);
            setCurrentView('month');
          }}
        >
          <h3 className="mb-2 text-center font-semibold">{month}</h3>
          <div className="grid grid-cols-7 gap-1">
            {renderMonthGridPreview(month)}
          </div>
        </div>
      ))}
    </div>
  );
  
  const renderMonthView = (month: string) => {
    const monthIndex = months.indexOf(month);
    const daysInMonth = new Date(2024, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(2024, monthIndex, 1).getDay();

    return (
      <div>
        <div className="mb-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('year')}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-2xl font-bold">{month} 2024</h2>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-muted-foreground">{day}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, day) => (
            <div
              key={day}
              className="cursor-pointer"
              onClick={() => {
                setCurrentDay(day + 1);
                setCurrentView('day');
              }}
            >
              <div className="flex flex-col items-center justify-center rounded-lg border p-2 text-center">
                <span>{day + 1}</span>
                <ColorBlock year={2024} month={monthIndex + 1} day={day + 1} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => (
    <div>
      <div className="mb-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView('month')}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-2xl font-bold">{currentMonth} {currentDay}, 2024</h2>
      </div>
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h3 className="text-lg font-semibold">Commit Diff</h3>
        <p className="text-muted-foreground">(CommitDiffDisplay component will be migrated here)</p>
        {/* Mock display */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between"><span>feature</span><span>5</span></div>
          <div className="flex justify-between"><span>bug</span><span>2</span></div>
          <div className="flex justify-between"><span>documentation</span><span>1</span></div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'year':
        return renderYearView();
      case 'month':
        return renderMonthView(currentMonth);
      case 'day':
        return renderDayView();
      default:
        return renderYearView();
    }
  };

  return (
    <div className={`flex h-screen flex-col ${isDarkMode ? 'dark' : ''} bg-background text-foreground`}>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-semibold">{session?.user?.name || 'Guest'} | 2024 - {selectedLocation}</h1>
            <div className="flex items-center gap-2">
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
        </div>
        {renderContent()}
      </main>
      
      {/* Location Selector */}
      <div className="border-t p-4">
        <p className="text-center font-semibold">Location</p>
        <div className="flex justify-center gap-2 pt-2">
            {locations && locations.map((loc: any) => (
                <Button key={loc.id} variant={selectedLocation === loc.name ? "default" : "outline"} onClick={() => setSelectedLocation(loc.name)}>
                    {loc.name}
                </Button>
            ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="grid grid-cols-2 items-center border-t">
        <Button variant="ghost" className="flex flex-col h-16" onClick={() => router.push('/location')}>
          <Send />
          <span>Location</span>
        </Button>
        <Button variant="ghost" className="flex flex-col h-16" onClick={() => router.push('/camera')}>
          <Camera />
          <span>Camera</span>
        </Button>
      </footer>
    </div>
  );
}
