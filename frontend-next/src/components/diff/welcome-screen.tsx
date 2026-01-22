'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { fetcher } from '@/lib/fetcher';
import { Switch } from '@/components/ui/switch';
import { Camera, ChevronLeft, Send } from 'lucide-react';
import { useUserSettingsStore } from '@/store/user-settings';
import {
  formatJstDate,
  formatJstMonth,
  formatJstMonthYear,
  formatUtcDateKey,
} from '@/lib/datetime';

const months = Array.from({ length: 12 }, (_, index) =>
  formatJstMonth(new Date(Date.UTC(2024, index, 1)))
);

const colorScale = [
  'bg-gray-200 dark:bg-gray-700',
  'bg-green-200 dark:bg-green-900',
  'bg-green-400 dark:bg-green-700',
  'bg-green-600 dark:bg-green-500',
];

type Location = {
  id: number;
  name: string;
};

type HeatmapResponse = {
  year: number;
  days: Record<string, number>;
};

type DaySummary = {
  commitCount: number;
  items: Array<{
    itemName: string;
    deltaCount: number;
    changeTypes: Record<string, number>;
  }>;
};

function getColorClass(count: number, maxCount: number) {
  if (!count || maxCount <= 0) {
    return colorScale[0];
  }
  const intensity = Math.min(3, Math.max(1, Math.ceil((count / maxCount) * 3)));
  return colorScale[intensity];
}

export function WelcomeScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const { isDarkMode, toggleDarkMode } = useUserSettingsStore();
  const { data: locations, error: locationsError } = useSWR<Location[]>(
    '/api/locations',
    fetcher
  );
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState('year');
  const [currentMonth, setCurrentMonth] = useState(months[0]);
  const [currentDay, setCurrentDay] = useState(1);
  const currentYear = new Date().getUTCFullYear();

  useEffect(() => {
    if (locations && locations.length > 0 && selectedLocationId === null) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const selectedLocation = locations?.find(
    (location) => location.id === selectedLocationId
  );

  const heatmapUrl = selectedLocationId
    ? `/api/analytics/heatmap?locationId=${selectedLocationId}&year=${currentYear}`
    : null;
  const { data: heatmapData, error: heatmapError } = useSWR<HeatmapResponse>(
    heatmapUrl,
    fetcher
  );

  const heatmapCounts = heatmapData?.days ?? {};
  const maxCount = useMemo(() => {
    const values = Object.values(heatmapCounts);
    return values.length > 0 ? Math.max(...values) : 0;
  }, [heatmapCounts]);

  const currentMonthIndex = months.indexOf(currentMonth);
  const dayKey = formatUtcDateKey(currentYear, currentMonthIndex + 1, currentDay);
  const daySummaryUrl = selectedLocationId
    ? `/api/commits?locationId=${selectedLocationId}&date=${dayKey}`
    : null;
  const { data: daySummary, error: daySummaryError } = useSWR<DaySummary>(
    daySummaryUrl,
    fetcher
  );

  const renderMonthGridPreview = (month: string) => {
    const monthIndex = months.indexOf(month);
    const daysInMonth = new Date(Date.UTC(currentYear, monthIndex + 1, 0)).getUTCDate();
    const firstDayOfWeek = new Date(Date.UTC(currentYear, monthIndex, 1)).getUTCDay();

    return (
      <>
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, day) => {
          const count = heatmapCounts[
            formatUtcDateKey(currentYear, monthIndex + 1, day + 1)
          ];
          return (
            <div
              key={day}
              className={`aspect-square w-full rounded-sm ${getColorClass(
                count ?? 0,
                maxCount
              )}`}
            />
          );
        })}
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
    const daysInMonth = new Date(Date.UTC(currentYear, monthIndex + 1, 0)).getUTCDate();
    const firstDayOfWeek = new Date(Date.UTC(currentYear, monthIndex, 1)).getUTCDay();
    const monthLabel = formatJstMonthYear(
      new Date(Date.UTC(currentYear, monthIndex, 1))
    );

    return (
      <div>
        <div className="mb-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('year')}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-2xl font-bold">{monthLabel}</h2>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, day) => {
            const dateKey = formatUtcDateKey(currentYear, monthIndex + 1, day + 1);
            const count = heatmapCounts[dateKey] ?? 0;
            return (
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
                  <div
                    className={`mt-1 h-3 w-3 rounded-full ${getColorClass(
                      count,
                      maxCount
                    )}`}
                  />
                </div>
              </div>
            );
          })}
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
        <h2 className="text-2xl font-bold">
          {formatJstDate(new Date(Date.UTC(currentYear, currentMonthIndex, currentDay)))}
        </h2>
      </div>
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h3 className="text-lg font-semibold">Commit Summary</h3>
        {daySummaryError && (
          <p className="text-sm text-red-500">データの取得に失敗しました。</p>
        )}
        {!daySummary && !daySummaryError && (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        )}
        {daySummary && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Commit count: {daySummary.commitCount}
            </p>
            {daySummary.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">この日の記録はありません。</p>
            ) : (
              <div className="space-y-2">
                {daySummary.items.map((item) => {
                  const deltaLabel =
                    item.deltaCount > 0 ? `+${item.deltaCount}` : `${item.deltaCount}`;
                  return (
                    <div
                      key={item.itemName}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>{item.itemName}</span>
                      <span>{deltaLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
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
      <main className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {session?.user?.name || 'Guest'} | {currentYear} -{' '}
            {selectedLocation?.name ?? 'No location'}
          </h1>
          <div className="flex items-center gap-2">
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </div>
        {heatmapError && (
          <p className="mb-4 text-sm text-red-500">カレンダーの取得に失敗しました。</p>
        )}
        {renderContent()}
      </main>

      <div className="border-t p-4">
        <p className="text-center font-semibold">Location</p>
        {locationsError && (
          <p className="pt-2 text-center text-sm text-red-500">
            ロケーションの取得に失敗しました。
          </p>
        )}
        {locations && locations.length === 0 && (
          <p className="pt-2 text-center text-sm text-muted-foreground">
            ロケーションがまだありません。
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {locations?.map((loc) => (
            <Button
              key={loc.id}
              variant={selectedLocationId === loc.id ? 'default' : 'outline'}
              onClick={() => setSelectedLocationId(loc.id)}
            >
              {loc.name}
            </Button>
          ))}
        </div>
      </div>

      <footer className="grid grid-cols-2 items-center border-t">
        <Button variant="ghost" className="flex h-16 flex-col" onClick={() => router.push('/location')}>
          <Send />
          <span>Location</span>
        </Button>
        <Button variant="ghost" className="flex h-16 flex-col" onClick={() => router.push('/camera')}>
          <Camera />
          <span>Camera</span>
        </Button>
      </footer>
    </div>
  );
}
