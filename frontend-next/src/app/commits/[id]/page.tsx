"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetcher } from "@/lib/fetcher";
import { formatJstDateTime } from "@/lib/datetime";
import { isValidCommitItemCounts } from "@/lib/commit-items";

type ChangeType = "ADDED" | "MODIFIED" | "DELETED";

type CommitItem = {
  itemName: string;
  changeType: ChangeType;
  previousCount: number;
  currentCount: number;
};

type CommitEdit = {
  id: number;
  createdAt: string;
  note?: string | null;
  beforeItems: unknown;
  afterItems: unknown;
};

type CommitDetail = {
  id: number;
  status: "DRAFT" | "CONFIRMED";
  source: string;
  captureId: number;
  capture: {
    id: number;
    imageUrl: string;
    capturedAt: string;
  };
  location: {
    id: number;
    name: string;
  };
  items: CommitItem[];
  edits: CommitEdit[];
};

type EditableItem = CommitItem & { id: string };

const changeTypeOptions: Array<{ value: ChangeType; label: string }> = [
  { value: "ADDED", label: "追加" },
  { value: "MODIFIED", label: "変更" },
  { value: "DELETED", label: "削除" },
];

function createEditableItem(): EditableItem {
  return {
    id: `${Date.now()}-${Math.random()}`,
    itemName: "",
    changeType: "ADDED",
    previousCount: 0,
    currentCount: 0,
  };
}

function parseItems(value: unknown): CommitItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const record = item as CommitItem;
      if (
        typeof record.itemName !== "string" ||
        typeof record.changeType !== "string"
      ) {
        return null;
      }
      return record;
    })
    .filter(Boolean) as CommitItem[];
}

export default function CommitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const listId = useId();
  const { data: commit, error, mutate } = useSWR<CommitDetail>(
    `/api/commits/${params.id}`,
    fetcher
  );
  const { data: itemSuggestions } = useSWR<{ items: string[] }>(
    "/api/items?limit=200",
    fetcher
  );
  const [items, setItems] = useState<EditableItem[]>([createEditableItem()]);
  const [status, setStatus] = useState<CommitDetail["status"]>("CONFIRMED");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!commit) {
      return;
    }
    setItems(
      commit.items.map((item) => ({
        ...item,
        id: `${Date.now()}-${Math.random()}`,
      }))
    );
    setStatus(commit.status);
  }, [commit]);

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.changeType] += 1;
        return acc;
      },
      { ADDED: 0, MODIFIED: 0, DELETED: 0 }
    );
  }, [items]);

  const handleItemChange = <K extends keyof EditableItem>(
    id: string,
    key: K,
    value: EditableItem[K]
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, createEditableItem()]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      return next.length > 0 ? next : [createEditableItem()];
    });
  };

  const handleSave = async () => {
    if (!commit) {
      return;
    }
    const sanitizedItems = items
      .map((item) => ({
        itemName: item.itemName.trim(),
        changeType: item.changeType,
        previousCount: Math.max(0, Math.floor(item.previousCount)),
        currentCount: Math.max(0, Math.floor(item.currentCount)),
      }))
      .filter((item) => item.itemName.length > 0);

    if (sanitizedItems.length === 0) {
      setErrorMessage("項目を追加してください。");
      return;
    }

    const hasInvalidCounts = sanitizedItems.some((item) =>
      !isValidCommitItemCounts({
        changeType: item.changeType,
        previousCount: item.previousCount,
        currentCount: item.currentCount,
      })
    );
    if (hasInvalidCounts) {
      setErrorMessage("追加は前=0/今>0、削除は前>0/今=0、変更は前≠今で入力してください。");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/commits/${commit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: sanitizedItems,
          status,
          note: note.trim() ? note.trim() : undefined,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update commit");
      }
      setNote("");
      await mutate();
    } catch (err) {
      console.error(err);
      setErrorMessage("更新に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!commit) {
      return;
    }
    if (!window.confirm("このコミットを削除しますか？")) {
      return;
    }
    try {
      const response = await fetch(`/api/commits/${commit.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete commit");
      }
      router.push(`/captures/${commit.captureId}`);
    } catch (err) {
      console.error(err);
      setErrorMessage("削除に失敗しました。");
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-var(--app-header-height))] items-center justify-center text-red-500">
        コミットの取得に失敗しました。
      </div>
    );
  }

  if (!commit) {
    return (
      <div className="flex min-h-[calc(100vh-var(--app-header-height))] items-center justify-center text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Commit #{commit.id}</h1>
          <p className="text-sm text-muted-foreground">
            {commit.location.name} ・ {formatJstDateTime(new Date(commit.capture.capturedAt))}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/captures/${commit.captureId}`)}
          >
            Back to Capture
          </Button>
          <Button variant="ghost" onClick={handleDelete}>
            Delete Commit
          </Button>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <img
          src={commit.capture.imageUrl}
          alt={`Capture ${commit.captureId}`}
          className="h-72 w-full object-cover"
        />
      </div>

      {errorMessage && (
        <div className="rounded-md bg-red-100 p-3 text-center text-red-500">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border p-3 text-center">
          <p className="text-sm text-muted-foreground">追加</p>
          <p className="text-2xl font-semibold">{summary.ADDED}</p>
        </div>
        <div className="rounded-md border p-3 text-center">
          <p className="text-sm text-muted-foreground">変更</p>
          <p className="text-2xl font-semibold">{summary.MODIFIED}</p>
        </div>
        <div className="rounded-md border p-3 text-center">
          <p className="text-sm text-muted-foreground">削除</p>
          <p className="text-2xl font-semibold">{summary.DELETED}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as CommitDetail["status"])
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <Label>Note</Label>
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="編集メモ"
            />
          </div>
        </div>

        <div className="space-y-4">
          <datalist id={listId}>
            {itemSuggestions?.items.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          {items.map((item) => (
            <div key={item.id} className="rounded-md border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1 space-y-2">
                  <Label>項目名</Label>
                  <Input
                    list={listId}
                    value={item.itemName}
                    onChange={(event) =>
                      handleItemChange(item.id, "itemName", event.target.value)
                    }
                    placeholder="例: book"
                  />
                </div>
                <div className="w-full md:w-40">
                  <Label>変更種別</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={item.changeType}
                    onChange={(event) =>
                      handleItemChange(
                        item.id,
                        "changeType",
                        event.target.value as ChangeType
                      )
                    }
                  >
                    {changeTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>前の数</Label>
                  <Input
                    type="number"
                    value={item.previousCount}
                    onChange={(event) =>
                      handleItemChange(
                        item.id,
                        "previousCount",
                        Number(event.target.value)
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>今の数</Label>
                  <Input
                    type="number"
                    value={item.currentCount}
                    onChange={(event) =>
                      handleItemChange(
                        item.id,
                        "currentCount",
                        Number(event.target.value)
                      )
                    }
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={handleAddItem}>
            Add Item
          </Button>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full py-6 text-lg">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Edit History</h2>
        <div className="space-y-4">
          {commit.edits.length === 0 && (
            <p className="text-sm text-muted-foreground">履歴はありません。</p>
          )}
          {commit.edits.map((edit) => {
            const beforeItems = parseItems(edit.beforeItems);
            const afterItems = parseItems(edit.afterItems);
            return (
              <div key={edit.id} className="rounded-md border p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {formatJstDateTime(new Date(edit.createdAt))}
                  </p>
                  <p className="text-muted-foreground">
                    {beforeItems.length} → {afterItems.length} items
                  </p>
                </div>
                {edit.note && (
                  <p className="mt-2 text-muted-foreground">Note: {edit.note}</p>
                )}
                <div className="mt-3 space-y-2">
                  {afterItems.slice(0, 5).map((item) => (
                    <div key={`${edit.id}-${item.itemName}`} className="flex justify-between">
                      <span>
                        {item.itemName} ({item.changeType})
                      </span>
                      <span>
                        {item.previousCount} → {item.currentCount}
                      </span>
                    </div>
                  ))}
                  {afterItems.length > 5 && (
                    <p className="text-muted-foreground">and {afterItems.length - 5} more...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
