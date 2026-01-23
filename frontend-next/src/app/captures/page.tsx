"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { formatJstDateTime } from "@/lib/datetime";

type Location = {
  id: number;
  name: string;
};

type Capture = {
  id: number;
  imageUrl: string;
  capturedAt: string;
  analysisStatus: "PENDING" | "ANALYZED" | "FAILED";
  locationId: number;
  commit?: { id: number } | null;
};

const statusOptions = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ANALYZED", label: "Analyzed" },
  { value: "FAILED", label: "Failed" },
];

export default function CapturesPage() {
  const router = useRouter();
  const { data: locations, error: locationsError } = useSWR<Location[]>(
    "/api/locations",
    fetcher
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const capturesUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (selectedLocationId !== "all") {
      params.set("locationId", selectedLocationId);
    }
    if (selectedStatus !== "all") {
      params.set("status", selectedStatus);
    }
    return `/api/captures?${params.toString()}`;
  }, [selectedLocationId, selectedStatus]);

  const {
    data: captures,
    error: capturesError,
    mutate,
  } = useSWR<Capture[]>(capturesUrl, fetcher);

  const handleDelete = async (captureId: number) => {
    if (!window.confirm("このキャプチャを削除しますか？")) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/captures/${captureId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete capture");
      }
      await mutate();
    } catch (err) {
      console.error(err);
      setError("削除に失敗しました。");
    }
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Captures</h1>
          <p className="text-sm text-muted-foreground">
            画像の履歴と解析ステータスを確認できます。
          </p>
        </div>
        <Button
          onClick={() => router.push("/camera")}
          className="w-full sm:w-auto"
        >
          New Capture
        </Button>
      </header>

      <div className="grid gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Location</p>
          {locationsError && (
            <p className="text-sm text-red-500">ロケーションの取得に失敗しました。</p>
          )}
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
      </div>

      {error && (
        <div className="rounded-md bg-red-100 p-3 text-center text-sm text-red-500">
          {error}
        </div>
      )}
      {capturesError && (
        <div className="rounded-md bg-red-100 p-3 text-center text-sm text-red-500">
          キャプチャの取得に失敗しました。
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {captures?.map((capture) => (
          <div
            key={capture.id}
            className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Capture #{capture.id}</p>
              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                {capture.analysisStatus}
              </span>
            </div>
            <div className="overflow-hidden rounded-md border">
              <img
                src={capture.imageUrl}
                alt={`Capture ${capture.id}`}
                className="h-40 w-full object-cover"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {formatJstDateTime(new Date(capture.capturedAt))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/captures/${capture.id}`)}
              >
                View
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleDelete(capture.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {captures && captures.length === 0 && (
          <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground shadow-sm">
            キャプチャがまだありません。
          </div>
        )}
      </div>
    </div>
  );
}
