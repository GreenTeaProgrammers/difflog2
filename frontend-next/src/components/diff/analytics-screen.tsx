'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { formatJstDate, formatJstMonth } from '@/lib/datetime';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

type Location = {
  id: number;
  name: string;
};

type MonthlyResponse = {
  months: Array<{ month: string; count: number }>;
};

type HeatmapResponse = {
  year: number;
  days: Record<string, number>;
};

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildMonthKey(year: number, monthIndex: number) {
  const month = `${monthIndex + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(Date.UTC(year, month - 1, day));
}

function getDaysInYear(year: number) {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

export function AnalyticsScreen() {
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const currentYear = new Date().getUTCFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

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
    ? `/api/analytics/monthly?locationId=${selectedLocationId}&year=${selectedYear}`
    : null;
  const { data: monthlyData, error: monthlyError } = useSWR<MonthlyResponse>(
    monthlyUrl,
    fetcher
  );

  const heatmapUrl = selectedLocationId
    ? `/api/analytics/heatmap?locationId=${selectedLocationId}&year=${selectedYear}`
    : null;
  const { data: heatmapData, error: heatmapError } = useSWR<HeatmapResponse>(
    heatmapUrl,
    fetcher
  );

  const heatmapCounts = heatmapData?.days ?? {};

  const chartData = useMemo(() => {
    const monthMap = new Map<string, number>();
    monthlyData?.months.forEach((entry) => {
      monthMap.set(entry.month, entry.count);
    });

    return Array.from({ length: 12 }, (_, index) => {
      const key = buildMonthKey(selectedYear, index);
      return {
        key,
        label: formatJstMonth(new Date(Date.UTC(selectedYear, index, 1))),
        value: monthMap.get(key) ?? 0,
      };
    });
  }, [monthlyData, selectedYear]);

  const totalCommits = useMemo(() => {
    return Object.values(heatmapCounts).reduce((sum, value) => sum + value, 0);
  }, [heatmapCounts]);

  const activeDays = useMemo(() => {
    return Object.values(heatmapCounts).filter((value) => value > 0).length;
  }, [heatmapCounts]);

  const daysInYear = useMemo(() => getDaysInYear(selectedYear), [selectedYear]);

  const longestStreak = useMemo(() => {
    const start = new Date(Date.UTC(selectedYear, 0, 1));
    const end = new Date(Date.UTC(selectedYear, 11, 31));
    let current = 0;
    let longest = 0;

    for (let date = new Date(start); date <= end; ) {
      const key = buildMonthKey(selectedYear, date.getUTCMonth());
      const dayKey = `${key}-${`${date.getUTCDate()}`.padStart(2, '0')}`;
      if ((heatmapCounts[dayKey] ?? 0) > 0) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
      date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    }

    return longest;
  }, [heatmapCounts, selectedYear]);

  const peakDay = useMemo(() => {
    let maxCount = 0;
    let maxKey: string | null = null;
    for (const [key, count] of Object.entries(heatmapCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxKey = key;
      }
    }
    const date = maxKey ? parseDateKey(maxKey) : null;
    return date ? { date, count: maxCount } : null;
  }, [heatmapCounts]);

  const avgPerWeek = useMemo(() => {
    const weeks = Math.ceil(daysInYear / 7);
    return weeks > 0 ? totalCommits / weeks : 0;
  }, [daysInYear, totalCommits]);

  const avgPerActiveDay = useMemo(() => {
    return activeDays > 0 ? totalCommits / activeDays : 0;
  }, [activeDays, totalCommits]);

  const weekdayData = useMemo(() => {
    const counts = Array.from({ length: 7 }, () => 0);
    Object.entries(heatmapCounts).forEach(([key, count]) => {
      const date = parseDateKey(key);
      if (!date) {
        return;
      }
      counts[date.getUTCDay()] += count;
    });

    return weekdayLabels.map((label, index) => ({
      day: label,
      value: counts[index] ?? 0,
    }));
  }, [heatmapCounts]);

  const topDays = useMemo(() => {
    return Object.entries(heatmapCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => {
        const date = parseDateKey(key);
        return {
          key,
          count,
          date,
        };
      })
      .filter((entry) => entry.date);
  }, [heatmapCounts]);

  const peakMonth = useMemo(() => {
    let max = 0;
    let monthIndex = 0;
    chartData.forEach((entry, index) => {
      if (entry.value > max) {
        max = entry.value;
        monthIndex = index;
      }
    });
    if (max === 0) {
      return null;
    }
    return {
      label: formatJstMonth(new Date(Date.UTC(selectedYear, monthIndex, 1))),
      count: max,
    };
  }, [chartData, selectedYear]);

  const activeRatio = daysInYear > 0 ? (activeDays / daysInYear) * 100 : 0;

  return (
    <div className="relative min-h-[calc(100vh-var(--app-header-height))] bg-[color:var(--shell-bg)] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--shell-bg),_var(--shell-bg-muted)_55%,_var(--shell-bg)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(140deg,rgba(31,136,61,0.08),transparent_40%),radial-gradient(circle_at_top_right,rgba(14,116,144,0.16),transparent_45%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--shell-accent)]">
              Analytics
            </p>
            <h1 className="text-2xl font-semibold">Activity Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              ロケーションごとのコミット傾向を把握できます。
            </p>
            {locationsError && (
              <p className="mt-2 text-sm text-red-500">
                ロケーションの取得に失敗しました。
              </p>
            )}
            {(monthlyError || heatmapError) && (
              <p className="mt-2 text-sm text-red-500">
                分析データの取得に失敗しました。
              </p>
            )}
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <select
              className="w-full rounded-md border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] px-3 py-2 text-sm sm:w-auto"
              value={selectedLocationId ?? ''}
              onChange={(event) =>
                setSelectedLocationId(Number(event.target.value))
              }
              disabled={!locations || locations.length === 0}
            >
              <option value="" disabled>
                Location
              </option>
              {locations?.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-md border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] px-3 py-2 text-sm sm:w-auto"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total Commits
            </p>
            <p className="mt-2 text-2xl font-semibold">{totalCommits}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedYear} 年の合計
            </p>
          </div>
          <div className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Active Days
            </p>
            <p className="mt-2 text-2xl font-semibold">{activeDays}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeRatio.toFixed(1)}% of {daysInYear} days
            </p>
          </div>
          <div className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Longest Streak
            </p>
            <p className="mt-2 text-2xl font-semibold">{longestStreak} days</p>
            <p className="mt-1 text-xs text-muted-foreground">連続記録</p>
          </div>
          <div className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Peak Day
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {peakDay ? formatJstDate(peakDay.date) : '—'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {peakDay ? `${peakDay.count} commits` : 'No data yet'}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Monthly Trend</h2>
                <p className="text-xs text-muted-foreground">
                  月別のコミット推移
                </p>
              </div>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -8, right: 8 }}>
                  <defs>
                    <linearGradient id="commitTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--shell-accent)"
                        stopOpacity={0.65}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--shell-accent)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--shell-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--shell-panel)',
                      borderColor: 'var(--shell-border)',
                      color: 'var(--shell-header)',
                    }}
                    formatter={(value: number) => [`${value} commits`, 'Commits']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--shell-accent)"
                    strokeWidth={2}
                    fill="url(#commitTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold">Weekday Mix</h2>
              <p className="text-xs text-muted-foreground">曜日別の傾向</p>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData} margin={{ left: -8, right: 8 }}>
                  <CartesianGrid stroke="var(--shell-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--shell-panel)',
                      borderColor: 'var(--shell-border)',
                      color: 'var(--shell-header)',
                    }}
                    formatter={(value: number) => [`${value} commits`, 'Commits']}
                  />
                  <Bar dataKey="value" fill="var(--shell-accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <div className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Top Days</h2>
                <p className="text-xs text-muted-foreground">コミットが多い日</p>
              </div>
              <span className="rounded-full border border-[color:var(--shell-border)] bg-[color:var(--shell-panel-muted)] px-3 py-1 text-xs text-muted-foreground">
                {topDays.length} days
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {topDays.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  データがまだありません。
                </p>
              )}
              {topDays.map((day) => (
                <div
                  key={day.key}
                  className="flex items-center justify-between rounded-md border border-[color:var(--shell-border)] bg-[color:var(--shell-panel-muted)] px-3 py-2 text-sm"
                >
                  <span>{day.date ? formatJstDate(day.date) : day.key}</span>
                  <span className="font-semibold">{day.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold">Insights</h2>
              <p className="text-xs text-muted-foreground">年間のまとめ</p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg / week</span>
                <span className="font-semibold">{avgPerWeek.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg / active day</span>
                <span className="font-semibold">{avgPerActiveDay.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Peak month</span>
                <span className="font-semibold">
                  {peakMonth ? `${peakMonth.label} (${peakMonth.count})` : '—'}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
