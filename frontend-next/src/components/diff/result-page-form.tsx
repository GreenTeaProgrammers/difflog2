'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetcher } from '@/lib/fetcher';
import { FilePenLine, Loader2, Plus, Trash2 } from 'lucide-react';

type ChangeType = 'ADDED' | 'MODIFIED' | 'DELETED';

type EditableItem = {
  id: string;
  itemName: string;
  changeType: ChangeType;
  previousCount: number;
  currentCount: number;
};

type CaptureResponse = {
  id: number;
  imageUrl: string;
  commit?: {
    id: number;
    items: Array<{
      itemName: string;
      changeType: ChangeType;
      previousCount: number;
      currentCount: number;
    }>;
  } | null;
};

const changeTypeOptions: Array<{ value: ChangeType; label: string }> = [
  { value: 'ADDED', label: '追加' },
  { value: 'MODIFIED', label: '変更' },
  { value: 'DELETED', label: '削除' },
];

function createEmptyItem(): EditableItem {
  return {
    id: `${Date.now()}-${Math.random()}`,
    itemName: '',
    changeType: 'ADDED',
    previousCount: 0,
    currentCount: 0,
  };
}

export function ResultPageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const captureIdParam = searchParams.get('captureId');
  const captureId = captureIdParam ? Number(captureIdParam) : NaN;
  const [items, setItems] = useState<EditableItem[]>([createEmptyItem()]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const captureUrl = Number.isInteger(captureId)
    ? `/api/captures/${captureId}`
    : null;
  const { data: capture, error: captureError } = useSWR<CaptureResponse>(
    captureUrl,
    fetcher
  );

  const commitExists = Boolean(capture?.commit?.id);

  useEffect(() => {
    if (capture?.commit?.items && !initialized) {
      setItems(
        capture.commit.items.map((item) => ({
          id: `${Date.now()}-${Math.random()}`,
          itemName: item.itemName,
          changeType: item.changeType,
          previousCount: item.previousCount,
          currentCount: item.currentCount,
        }))
      );
      setInitialized(true);
    }
  }, [capture?.commit?.items, initialized]);

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
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      return next.length > 0 ? next : [createEmptyItem()];
    });
  };

  const handleSave = async () => {
    if (commitExists) {
      setError('このキャプチャはすでに保存されています。');
      return;
    }
    if (!Number.isInteger(captureId)) {
      setError('キャプチャIDが見つかりませんでした。');
      return;
    }

    const sanitizedItems = items
      .map((item) => ({
        ...item,
        itemName: item.itemName.trim(),
        previousCount: Math.max(0, Math.floor(item.previousCount)),
        currentCount: Math.max(0, Math.floor(item.currentCount)),
      }))
      .filter((item) => item.itemName.length > 0);

    if (sanitizedItems.length === 0) {
      setError('項目を追加してください。');
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      captureId,
      status: 'CONFIRMED',
      source: 'manual',
      rawInference: {
        status: 'disabled',
        note: 'ML inference is currently deferred',
      },
      items: sanitizedItems.map((item) => ({
        itemName: item.itemName,
        changeType: item.changeType,
        previousCount: item.previousCount,
        currentCount: item.currentCount,
      })),
      beforeItems: [],
      afterItems: sanitizedItems.map((item) => ({
        itemName: item.itemName,
        changeType: item.changeType,
        previousCount: item.previousCount,
        currentCount: item.currentCount,
      })),
      note: 'Manual commit save',
    };

    try {
      const response = await fetch('/api/commits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '保存に失敗しました。');
      }

      router.push('/welcome');
    } catch (error) {
      console.error('Error saving commit:', error);
      setError('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  if (!Number.isInteger(captureId)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
        <p>解析結果がありません。再度お試しください。</p>
        <Button onClick={() => router.push('/camera')} className="mt-4">
          アップロード画面に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="mb-6 text-center text-3xl font-bold">解析結果</h1>
        {captureError && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-red-500">
            キャプチャの取得に失敗しました。
          </div>
        )}
        {capture?.imageUrl && (
          <div className="mb-6 flex justify-center">
            <img
              src={capture.imageUrl}
              alt="Capture"
              className="max-h-64 w-full max-w-md rounded-md object-cover"
            />
          </div>
        )}
        {commitExists && (
          <div className="mb-4 rounded-md bg-amber-100 p-3 text-center text-amber-700">
            すでに保存済みのキャプチャです。必要であれば新しいキャプチャを追加してください。
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-4">
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

          <div className="mt-6">
            <h2 className="mb-4 text-xl font-semibold">詳細な変更リスト</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-md border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="flex-1 space-y-2">
                      <Label>項目名</Label>
                      <Input
                        value={item.itemName}
                        onChange={(event) =>
                          handleItemChange(item.id, 'itemName', event.target.value)
                        }
                        placeholder="例: book"
                        disabled={commitExists}
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
                            'changeType',
                            event.target.value as ChangeType
                          )
                        }
                        disabled={commitExists}
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
                            'previousCount',
                            Number(event.target.value)
                          )
                        }
                        disabled={commitExists}
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
                            'currentCount',
                            Number(event.target.value)
                          )
                        }
                        disabled={commitExists}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={commitExists}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={handleAddItem}
              variant="outline"
              className="mt-4"
              disabled={commitExists}
            >
              <Plus className="mr-2 h-4 w-4" />
              項目を追加
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || commitExists}
          className="mt-8 w-full py-6 text-lg"
        >
          {isSaving ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <FilePenLine className="mr-2 h-6 w-6" />}
          保存
        </Button>
      </div>
    </div>
  );
}
