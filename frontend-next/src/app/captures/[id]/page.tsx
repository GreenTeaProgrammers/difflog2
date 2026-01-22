"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { formatJstDateTime } from "@/lib/datetime";

type CaptureDetail = {
  id: number;
  imageUrl: string;
  capturedAt: string;
  analysisStatus: "PENDING" | "ANALYZED" | "FAILED";
  location: {
    id: number;
    name: string;
  };
  commit?: {
    id: number;
    items: Array<{
      itemName: string;
      changeType: "ADDED" | "MODIFIED" | "DELETED";
      previousCount: number;
      currentCount: number;
    }>;
  } | null;
};

export default function CaptureDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: capture, error, mutate } = useSWR<CaptureDetail>(
    `/api/captures/${params.id}`,
    fetcher
  );

  const handleDelete = async () => {
    if (!window.confirm("このキャプチャを削除しますか？")) {
      return;
    }
    try {
      const response = await fetch(`/api/captures/${params.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete capture");
      }
      router.push("/captures");
    } catch (err) {
      console.error(err);
      await mutate();
    }
  };

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        キャプチャの取得に失敗しました。
      </div>
    );
  }

  if (!capture) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  const commitExists = Boolean(capture.commit?.id);

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Capture #{capture.id}</h1>
          <p className="text-sm text-muted-foreground">
            {capture.location.name} ・ {formatJstDateTime(new Date(capture.capturedAt))}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/camera?locationId=${capture.location.id}`)}
          >
            Re-capture
          </Button>
          <Button variant="ghost" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <img
          src={capture.imageUrl}
          alt={`Capture ${capture.id}`}
          className="h-96 w-full object-cover"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-lg font-semibold">{capture.analysisStatus}</p>
        </div>
        <Button
          onClick={() =>
            router.push(
              commitExists
                ? `/commits/${capture.commit?.id}`
                : `/result?captureId=${capture.id}`
            )
          }
        >
          {commitExists ? "Edit Commit" : "Create Commit"}
        </Button>
      </div>

      {capture.commit && (
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Latest Commit Items</h2>
          <div className="space-y-2">
            {capture.commit.items.map((item) => (
              <div
                key={`${item.itemName}-${item.changeType}`}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span>
                  {item.itemName} ({item.changeType})
                </span>
                <span>
                  {item.previousCount} → {item.currentCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
