'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { fetcher } from '@/lib/fetcher';
import { ArrowLeft } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Location = {
  id: number;
  name: string;
};

type MonthlyResponse = {
  months: Array<{ month: string; count: number }>;
};

function buildMonthKey(year: number, monthIndex: number) {
  const month = `${monthIndex + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

export function AnalyticsScreen() {
  const router = useRouter();
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const currentYear = new Date().getUTCFullYear();

  const { data: locations, error: locationsError } = useSWR<Location[]>(
    '/api/locations',
    fetcher
  );

  useEffect(() => {
    if (locations && locations.length > 0 && selectedLocationId === null) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  const monthlyUrl = selectedLocationId
    ? `/api/analytics/monthly?locationId=${selectedLocationId}&year=${currentYear}`
    : null;
  const { data: monthlyData, error: monthlyError } = useSWR<MonthlyResponse>(
    monthlyUrl,
    fetcher
  );

  const chartData = useMemo(() => {
    const monthMap = new Map<string, number>();
    monthlyData?.months.forEach((entry) => {
      monthMap.set(entry.month, entry.count);
    });

    return Array.from({ length: 12 }, (_, index) => {
      const key = buildMonthKey(currentYear, index);
      return {
        date: key,
        value: monthMap.get(key) ?? 0,
      };
    });
  }, [monthlyData, currentYear]);

  return (
    <div className="flex h-[calc(100vh-var(--app-header-height))] flex-col bg-[color:var(--shell-bg)] text-foreground">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="ml-4 text-xl font-semibold">Analytics</h1>
      </header>

      <main className="flex-1 p-4">
        {monthlyError && (
          <p className="mb-4 text-sm text-red-500">データの取得に失敗しました。</p>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </main>

      <div className="border-t p-4">
        <p className="text-center font-semibold">Location</p>
        {locationsError && (
          <p className="pt-2 text-center text-sm text-red-500">
            ロケーションの取得に失敗しました。
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
    </div>
  );
}
