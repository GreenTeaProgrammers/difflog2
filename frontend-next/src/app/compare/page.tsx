"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { formatJstDate, formatJstDateTime } from "@/lib/datetime";

type Location = {
  id: number;
  name: string;
};

type CommitListItem = {
  id: number;
  createdAt: string;
  status: "DRAFT" | "CONFIRMED";
  locationId: number;
  location: { name: string };
  capture: { imageUrl: string; capturedAt: string };
};

type CommitListResponse = {
  commits: CommitListItem[];
};

type CommitDetail = {
  id: number;
  items: Array<{
    itemName: string;
    currentCount: number;
  }>;
  capture: { imageUrl: string; capturedAt: string };
};

export default function ComparePage() {
  const router = useRouter();
  const { data: locations, error: locationsError } = useSWR<Location[]>(
    "/api/locations",
    fetcher
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [commitAId, setCommitAId] = useState<string>("");
  const [commitBId, setCommitBId] = useState<string>("");

  const listUrl = selectedLocationId
    ? `/api/commits/list?locationId=${selectedLocationId}&limit=100`
    : null;
  const { data: commitList, error: commitListError } = useSWR<CommitListResponse>(
    listUrl,
    fetcher
  );

  const commitAUrl = commitAId ? `/api/commits/${commitAId}` : null;
  const commitBUrl = commitBId ? `/api/commits/${commitBId}` : null;
  const { data: commitA } = useSWR<CommitDetail>(commitAUrl, fetcher);
  const { data: commitB } = useSWR<CommitDetail>(commitBUrl, fetcher);

  const comparisonRows = useMemo(() => {
    if (!commitA && !commitB) {
      return [];
    }
    const mapA = new Map<string, number>();
    const mapB = new Map<string, number>();
    commitA?.items.forEach((item) => mapA.set(item.itemName, item.currentCount));
    commitB?.items.forEach((item) => mapB.set(item.itemName, item.currentCount));
    const names = new Set<string>([...mapA.keys(), ...mapB.keys()]);
    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => {
        const countA = mapA.get(name) ?? 0;
        const countB = mapB.get(name) ?? 0;
        return {
          name,
          countA,
          countB,
          delta: countB - countA,
        };
      });
  }, [commitA, commitB]);

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold">Compare Commits</h1>
        <p className="text-sm text-muted-foreground">
          同じロケーション内の2つのコミットを比較します。
        </p>
      </header>

      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Location</p>
            {locationsError && (
              <p className="text-sm text-red-500">
                ロケーションの取得に失敗しました。
              </p>
            )}
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedLocationId}
              onChange={(event) => {
                setSelectedLocationId(event.target.value);
                setCommitAId("");
                setCommitBId("");
              }}
            >
              <option value="">Select location</option>
              {locations?.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Commit A</p>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={commitAId}
              onChange={(event) => setCommitAId(event.target.value)}
              disabled={!commitList}
            >
              <option value="">Select commit</option>
              {commitList?.commits.map((commit) => (
                <option key={commit.id} value={commit.id}>
                  #{commit.id} · {formatJstDate(new Date(commit.createdAt))}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Commit B</p>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={commitBId}
              onChange={(event) => setCommitBId(event.target.value)}
              disabled={!commitList}
            >
              <option value="">Select commit</option>
              {commitList?.commits.map((commit) => (
                <option key={commit.id} value={commit.id}>
                  #{commit.id} · {formatJstDate(new Date(commit.createdAt))}
                </option>
              ))}
            </select>
          </div>
        </div>

        {commitListError && (
          <p className="mt-3 text-sm text-red-500">コミットの取得に失敗しました。</p>
        )}
        {commitList && commitList.commits.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">比較できるコミットがありません。</p>
        )}
      </div>

      {(commitA || commitB) && (
        <div className="grid gap-4 md:grid-cols-2">
          {[commitA, commitB].map((commit, index) => (
            <div key={index} className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold">
                {index === 0 ? "Commit A" : "Commit B"}
              </p>
              {commit ? (
                <div className="mt-3 space-y-3">
                  <img
                    src={commit.capture.imageUrl}
                    alt={`Commit ${commit.id}`}
                    className="h-40 w-full rounded-md object-cover"
                  />
                  <p className="text-sm text-muted-foreground">
                    {formatJstDateTime(new Date(commit.capture.capturedAt))}
                  </p>
                  <Button variant="outline" onClick={() => router.push(`/commits/${commit.id}`)}>
                    Open Commit
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  コミットを選択してください。
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {comparisonRows.length > 0 && (
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Diff Summary</h2>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setCommitAId("");
                setCommitBId("");
              }}
            >
              Reset Selection
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            {comparisonRows.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-2 items-center gap-2 rounded-md border px-3 py-2 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4"
              >
                <span className="col-span-2 sm:col-span-1">{row.name}</span>
                <span className="text-muted-foreground">
                  <span className="mr-1 text-[10px] uppercase text-muted-foreground sm:hidden">
                    A
                  </span>
                  {row.countA}
                </span>
                <span className="text-muted-foreground">
                  <span className="mr-1 text-[10px] uppercase text-muted-foreground sm:hidden">
                    B
                  </span>
                  {row.countB}
                </span>
                <span
                  className={
                    row.delta === 0
                      ? "text-muted-foreground"
                      : row.delta > 0
                        ? "text-green-600"
                        : "text-red-500"
                  }
                >
                  <span className="mr-1 text-[10px] uppercase text-muted-foreground sm:hidden">
                    Δ
                  </span>
                  {row.delta > 0 ? `+${row.delta}` : row.delta}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            左から、Commit A / Commit B / 差分
          </div>
        </div>
      )}
    </div>
  );
}
