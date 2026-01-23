'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { fetcher } from '@/lib/fetcher';
import { Switch } from '@/components/ui/switch';
import { Camera, MapPin } from 'lucide-react';
import { useUserSettingsStore } from '@/store/user-settings';
import { formatJstDate, formatJstMonth, formatUtcDateKey } from '@/lib/datetime';

const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const colorScale = [
  'bg-[color:var(--heat-0)]',
  'bg-[color:var(--heat-1)]',
  'bg-[color:var(--heat-2)]',
  'bg-[color:var(--heat-3)]',
  'bg-[color:var(--heat-4)]',
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
  const intensity = Math.min(4, Math.max(1, Math.ceil((count / maxCount) * 4)));
  return colorScale[intensity];
}

function buildYearWeeks(year: number) {
  const weeks: Array<Array<Date | null>> = [];
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  let current = new Date(start);
  let week: Array<Date | null> = Array.from({ length: 7 }, () => null);

  while (current <= end) {
    week[current.getUTCDay()] = new Date(current);
    if (current.getUTCDay() === 6) {
      weeks.push(week);
      week = Array.from({ length: 7 }, () => null);
    }
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }

  if (week.some(Boolean)) {
    weeks.push(week);
  }

  return weeks;
}

function buildMonthLabels(weeks: Array<Array<Date | null>>) {
  return weeks.map((week) => {
    const firstOfMonth = week.find((day) => day && day.getUTCDate() === 1);
    return firstOfMonth ? formatJstMonth(firstOfMonth) : '';
  });
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
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
  });
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
  const totalCount = useMemo(() => {
    return Object.values(heatmapCounts).reduce((sum, value) => sum + value, 0);
  }, [heatmapCounts]);
  const activeDays = useMemo(() => {
    return Object.values(heatmapCounts).filter((value) => value > 0).length;
  }, [heatmapCounts]);

  const weeks = useMemo(() => buildYearWeeks(currentYear), [currentYear]);
  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks]);

  const selectedDayKey = useMemo(() => {
    return formatUtcDateKey(
      currentYear,
      selectedDate.getUTCMonth() + 1,
      selectedDate.getUTCDate()
    );
  }, [currentYear, selectedDate]);

  const daySummaryUrl = selectedLocationId
    ? `/api/commits?locationId=${selectedLocationId}&date=${selectedDayKey}`
    : null;
  const { data: daySummary, error: daySummaryError } = useSWR<DaySummary>(
    daySummaryUrl,
    fetcher
  );

  const selectedCount = heatmapCounts[selectedDayKey] ?? 0;

  const gridStyle: CSSProperties = {
    '--cell-size': 'clamp(6px, 1.6vw, 12px)',
    '--cell-gap': 'clamp(1px, 0.35vw, 4px)',
  };

  return (
    <div
      className={`relative min-h-[calc(100vh-var(--app-header-height))] ${
        isDarkMode ? 'dark' : ''
      } bg-[color:var(--shell-bg)] text-foreground`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--shell-bg),_var(--shell-bg-muted)_55%,_var(--shell-bg)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(120deg,rgba(31,136,61,0.08),transparent_40%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.1),transparent_35%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--shell-accent)]">
              Overview
            </p>
            <h1 className="text-2xl font-semibold">
              DiffLog / {selectedLocation?.name ?? 'No location'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentYear} activity for {session?.user?.name || 'Guest'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] px-3 py-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {session?.user?.name || 'Guest'}
              </span>
              <span>•</span>
              <span>{selectedLocation?.name ?? 'No location'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Theme</span>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px,1fr,280px]">
          <aside className="space-y-6">
            <section className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-4 shadow-sm backdrop-blur animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Locations</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => router.push('/location')}
                >
                  Manage
                </Button>
              </div>
              {locationsError && (
                <p className="mt-2 text-sm text-red-500">
                  ロケーションの取得に失敗しました。
                </p>
              )}
              {locations && locations.length === 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  ロケーションがまだありません。
                </p>
              )}
              <div className="mt-3 space-y-2">
                {locations?.map((loc) => {
                  const isActive = selectedLocationId === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setSelectedLocationId(loc.id)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                        isActive
                          ? 'border-[color:var(--shell-accent)] bg-[color:var(--shell-accent-soft)] text-[color:var(--shell-accent)]'
                          : 'border-[color:var(--shell-border)] bg-[color:var(--shell-panel-muted)] text-foreground hover:border-[color:var(--shell-accent)]'
                      }`}
                    >
                      <span>{loc.name}</span>
                      {isActive && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-4 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
              <h2 className="text-sm font-semibold">Quick Actions</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/camera')}
                  className="group flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-[color:var(--shell-border)] bg-[color:var(--shell-panel-muted)] p-4 text-center transition hover:border-[color:var(--shell-accent)] hover:bg-[color:var(--shell-panel)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] text-[color:var(--shell-accent)] transition group-hover:border-[color:var(--shell-accent)]">
                    <Camera className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">New Capture</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Upload a photo and analyze changes.
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/location')}
                  className="group flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-[color:var(--shell-border)] bg-[color:var(--shell-panel-muted)] p-4 text-center transition hover:border-[color:var(--shell-accent)] hover:bg-[color:var(--shell-panel)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] text-[color:var(--shell-accent)] transition group-hover:border-[color:var(--shell-accent)]">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Manage Locations</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add or organize your workspaces.
                    </p>
                  </div>
                </button>
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            <section className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Contribution Graph</h2>
                  <p className="text-xs text-muted-foreground">
                    Click a day to inspect changes.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="flex items-center gap-1">
                    {colorScale.map((color, index) => (
                      <span
                        key={`legend-${index}`}
                        className={`h-3 w-3 rounded-sm ${color}`}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>

              {heatmapError && (
                <p className="mt-3 text-sm text-red-500">
                  カレンダーの取得に失敗しました。
                </p>
              )}

              <div className="mt-4 flex gap-3">
                <div className="hidden grid-rows-7 gap-1 text-[10px] text-muted-foreground sm:grid">
                  {dayLabels.map((label, index) => (
                    <div key={`label-${index}`} className="h-3">
                      {label}
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto pb-2" style={gridStyle}>
                  <div className="hidden grid-flow-col auto-cols-[var(--cell-size)] gap-[var(--cell-gap)] text-[10px] text-muted-foreground sm:grid">
                    {monthLabels.map((label, index) => (
                      <div key={`month-${index}`} className="h-4">
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 grid grid-flow-col auto-cols-[var(--cell-size)] grid-rows-7 gap-[var(--cell-gap)]">
                    {weeks.map((week, weekIndex) =>
                      week.map((date, dayIndex) => {
                        if (!date) {
                          return (
                            <div
                              key={`empty-${weekIndex}-${dayIndex}`}
                              className="h-[var(--cell-size)] w-[var(--cell-size)]"
                            />
                          );
                        }
                        const dayKey = formatUtcDateKey(
                          currentYear,
                          date.getUTCMonth() + 1,
                          date.getUTCDate()
                        );
                        const count = heatmapCounts[dayKey] ?? 0;
                        const isSelected = selectedDayKey === dayKey;
                        return (
                          <button
                            key={dayKey}
                            type="button"
                            onClick={() => setSelectedDate(new Date(date))}
                            className={`h-[var(--cell-size)] w-[var(--cell-size)] rounded-sm ${getColorClass(
                              count,
                              maxCount
                            )} ${
                              isSelected
                                ? 'ring-1 ring-[color:var(--shell-accent)] ring-offset-1 ring-offset-[color:var(--shell-panel)] sm:ring-2'
                                : ''
                            }`}
                            title={`${formatJstDate(date)} • ${count} commits`}
                            aria-label={`${formatJstDate(date)} ${count} commits`}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  {totalCount} total commits • {activeDays} active days
                </span>
                <span>Max {maxCount} in a day</span>
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-4 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Day Summary</h2>
                  <p className="text-xs text-muted-foreground">
                    {formatJstDate(selectedDate)}
                  </p>
                </div>
                <span className="rounded-full border border-[color:var(--shell-border)] bg-[color:var(--shell-panel-muted)] px-2 py-1 text-xs text-muted-foreground">
                  {selectedCount} commits
                </span>
              </div>

              {daySummaryError && (
                <p className="mt-3 text-sm text-red-500">
                  データの取得に失敗しました。
                </p>
              )}
              {!daySummary && !daySummaryError && (
                <p className="mt-3 text-sm text-muted-foreground">読み込み中...</p>
              )}
              {daySummary && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Commit count: {daySummary.commitCount}
                  </p>
                  {daySummary.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      この日の記録はありません。
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {daySummary.items.map((item) => {
                        const deltaLabel =
                          item.deltaCount > 0
                            ? `+${item.deltaCount}`
                            : `${item.deltaCount}`;
                        return (
                          <div
                            key={item.itemName}
                            className="flex items-center justify-between rounded-md border border-[color:var(--shell-border)] bg-[color:var(--shell-panel-muted)] px-3 py-2 text-sm"
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
            </section>

            <section className="rounded-xl border border-[color:var(--shell-border)] bg-[color:var(--shell-panel)] p-4 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
              <h2 className="text-sm font-semibold">Year Pulse</h2>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total commits</span>
                  <span className="font-semibold">{totalCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active days</span>
                  <span className="font-semibold">{activeDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Max in a day</span>
                  <span className="font-semibold">{maxCount}</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
