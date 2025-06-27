'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Info, BarChart, Camera, Home, LogOut, Menu, Send, X, ChevronLeft } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { cookies } from 'next/headers';


// Mock data for now
const locations = ["books", "kitchen", "desk", "store"];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ColorBlock = ({ year, month, day }: { year: number, month: number, day: number }) => {
  // Mock color based on date. In real app, fetch data.
  const hash = (year + month + day) % 4;
  const colors = ['bg-gray-200 dark:bg-gray-700', 'bg-green-200 dark:bg-green-800', 'bg-green-400 dark:bg-green-600', 'bg-green-600 dark:bg-green-400'];
  return <div className={`aspect-square w-full rounded-sm ${colors[hash]}`} />;
};

export function WelcomeScreen({username}: {username: string | undefined}) {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('desk');
  const [currentView, setCurrentView] = useState('year');
  const [currentMonth, setCurrentMonth] = useState(months[0]);
  const [currentDay, setCurrentDay] = useState(1);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you'd also toggle a class on the body
    document.documentElement.classList.toggle('dark');
  };

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
            <form action={logout}>
              <Button type="submit" variant="outline" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">{username || 'Guest'} | 2024 - {selectedLocation}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/analytics')}>
            <BarChart />
          </Button>
          <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {renderContent()}
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
