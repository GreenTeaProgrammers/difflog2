"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";

type Location = {
  id: number;
  name: string;
};

type TimelineItem = {
  id: number;
  imageUrl: string;
  capturedAt: string;
  analysisStatus: "PENDING" | "ANALYZED" | "FAILED";
  locationId: number;
  location: {
    id: number;
    name: string;
  };
  commit?: { id: number; status: "DRAFT" | "CONFIRMED" } | null;
};

type TimelineResponse = {
  items: TimelineItem[];
  nextCursor: string | null;
};

const statusOptions = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ANALYZED", label: "Analyzed" },
  { value: "FAILED", label: "Failed" },
];

const commitOptions = [
  { value: "all", label: "All" },
  { value: "with", label: "With Commit" },
  { value: "without", label: "Without Commit" },
];

export default function TimelinePage() {
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { data: locations, error: locationsError } = useSWR<Location[]>(
    "/api/locations",
    fetcher
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCommitFilter, setSelectedCommitFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [targetLocationId, setTargetLocationId] = useState<string>("");
  const [bulkError, setBulkError] = useState<string | null>(null);

  const getKey = (
    pageIndex: number,
    previousPageData: TimelineResponse | null
  ) => {
    if (previousPageData && !previousPageData.nextCursor) {
      return null;
    }
    const params = new URLSearchParams();
    params.set("limit", "20");
    if (selectedLocationId !== "all") {
      params.set("locationId", selectedLocationId);
    }
    if (selectedStatus !== "all") {
      params.set("status", selectedStatus);
    }
    if (selectedCommitFilter === "with") {
      params.set("hasCommit", "true");
    }
    if (selectedCommitFilter === "without") {
      params.set("hasCommit", "false");
    }
    if (pageIndex > 0 && previousPageData?.nextCursor) {
      params.set("cursor", previousPageData.nextCursor);
    }
    return `/api/timeline?${params.toString()}`;
  };

  const {
    data,
    error: timelineError,
    size,
    setSize,
    mutate,
    isValidating,
  } = useSWRInfinite<TimelineResponse>(getKey, fetcher);

  const items = useMemo(
    () => (data ? data.flatMap((page) => page.items) : []),
    [data]
  );
  const hasMore = data ? Boolean(data[data.length - 1]?.nextCursor) : false;

  useEffect(() => {
    setSize(1);
  }, [selectedLocationId, selectedStatus, selectedCommitFilter, setSize]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setSize((current) => current + 1);
      }
    });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, setSize]);

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  useEffect(() => {
    clearSelection();
  }, [selectedLocationId, selectedStatus, selectedCommitFilter]);

  const selectedCommitIds = items
    .filter((item) => selectedIds.includes(item.id) && item.commit?.id)
    .map((item) => item.commit?.id as number);

  const handleDeleteCaptures = async () => {
    if (selectedIds.length === 0) {
      return;
    }
    if (!window.confirm("選択したキャプチャを削除しますか？")) {
      return;
    }
    setBulkError(null);
    try {
      const response = await fetch("/api/captures/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", captureIds: selectedIds }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete captures");
      }
      clearSelection();
      await mutate();
    } catch (err) {
      console.error(err);
      setBulkError("削除に失敗しました。");
    }
  };

  const handleMoveCaptures = async () => {
    if (selectedIds.length === 0) {
      return;
    }
    if (!targetLocationId) {
      setBulkError("移動先のロケーションを選択してください。");
      return;
    }
    setBulkError(null);
    try {
      const response = await fetch("/api/captures/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move",
          captureIds: selectedIds,
          targetLocationId: Number(targetLocationId),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to move captures");
      }
      clearSelection();
      await mutate();
    } catch (err) {
      console.error(err);
      setBulkError("移動に失敗しました。");
    }
  };

  const handleDeleteCommits = async () => {
    if (selectedCommitIds.length === 0) {
      setBulkError("削除できるコミットがありません。");
      return;
    }
    if (!window.confirm("選択したコミットを削除しますか？")) {
      return;
    }
    setBulkError(null);
    try {
      const response = await fetch("/api/commits/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commitIds: selectedCommitIds }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete commits");
      }
      clearSelection();
      await mutate();
    } catch (err) {
      console.error(err);
      setBulkError("コミット削除に失敗しました。");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Timeline</h1>
          <p className="text-sm text-muted-foreground">
            キャプチャとコミットの履歴を一覧できます。
          </p>
        </div>
        <Button onClick={() => router.push("/camera")}>New Capture</Button>
      </header>

      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Location</p>
          {locationsError && (
            <p className="text-sm text-red-500">ロケーションの取得に失敗しました。</p>
          )}
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedLocationId}
            onChange={(event) => setSelectedLocationId(event.target.value)}
            disabled={!locations || locations.length === 0}
          >
            <option value="all">All</option>
            {locations?.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Status</p>
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Commit</p>
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedCommitFilter}
            onChange={(event) => setSelectedCommitFilter(event.target.value)}
          >
            {commitOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Selected: {selectedIds.length}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={targetLocationId}
              onChange={(event) => setTargetLocationId(event.target.value)}
            >
              <option value="">Move to...</option>
              {locations?.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={handleMoveCaptures}>
              Move Captures
            </Button>
            <Button variant="outline" onClick={handleDeleteCommits}>
              Delete Commits
            </Button>
            <Button variant="ghost" onClick={handleDeleteCaptures}>
              Delete Captures
            </Button>
            <Button variant="ghost" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
        {bulkError && (
          <p className="mt-2 text-sm text-red-500">{bulkError}</p>
        )}
      </div>

      {timelineError && (
        <div className="rounded-md bg-red-100 p-3 text-center text-sm text-red-500">
          タイムラインの取得に失敗しました。
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelection(item.id)}
                />
                Capture #{item.id}
              </label>
              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                {item.analysisStatus}
              </span>
            </div>
            <div className="overflow-hidden rounded-md border">
              <img
                src={item.imageUrl}
                alt={`Capture ${item.id}`}
                className="h-40 w-full object-cover"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {item.location.name} ・ {new Date(item.capturedAt).toLocaleString()}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/captures/${item.id}`)}
              >
                View
              </Button>
              {item.commit ? (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/commits/${item.commit?.id}`)}
                >
                  Edit Commit
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/result?captureId=${item.id}`)}
                >
                  Create Commit
                </Button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground shadow-sm">
            タイムラインに表示できるデータがありません。
          </div>
        )}
      </div>

      <div ref={loadMoreRef} className="py-6 text-center text-sm text-muted-foreground">
        {isValidating ? "読み込み中..." : hasMore ? "さらに読み込みます..." : "これ以上ありません。"}
      </div>
    </div>
  );
}
