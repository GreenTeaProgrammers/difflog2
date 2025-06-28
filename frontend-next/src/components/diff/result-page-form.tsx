'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MinusCircle, FilePenLine, Plus, Minus, Loader2 } from 'lucide-react';

// Mock data, assuming this comes from a previous step (e.g., Redux or context)
const mockDiffResponse = {
  added: 2,
  deleted: 1,
  modified: 3,
  changes: [
    { itemName: 'Book', changeType: 'added', previousCount: 5, currentCount: 7 },
    { itemName: 'Pen', changeType: 'deleted', previousCount: 3, currentCount: 2 },
    { itemName: 'Note', changeType: 'modified', previousCount: 1, currentCount: 1 },
  ],
};

export function ResultPageForm() {
  const router = useRouter();
  const [diffData, setDiffData] = useState(mockDiffResponse);
  const [isSaving, setIsSaving] = useState(false);

  const handleCountChange = (field: keyof typeof diffData, delta: number) => {
    setDiffData(prev => ({
      ...prev,
      [field]: Math.max(0, (prev[field] as number) + delta),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: API call to save the commit
    console.log('Saving commit:', diffData);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    setIsSaving(false);
    router.push('/welcome');
  };

  if (!diffData) {
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
    <div className="container mx-auto max-w-lg py-8">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="mb-6 text-center text-3xl font-bold">解析結果</h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>追加された項目数</Label>
            <div className="flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-green-500" />
              <Input type="number" readOnly value={diffData.added} className="flex-1" />
              <Button variant="outline" size="icon" onClick={() => handleCountChange('added', -1)}><Minus className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => handleCountChange('added', 1)}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>削除された項目数</Label>
            <div className="flex items-center space-x-2">
              <MinusCircle className="h-5 w-5 text-red-500" />
              <Input type="number" readOnly value={diffData.deleted} className="flex-1" />
              <Button variant="outline" size="icon" onClick={() => handleCountChange('deleted', -1)}><Minus className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => handleCountChange('deleted', 1)}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>変更された項目数</Label>
            <div className="flex items-center space-x-2">
              <FilePenLine className="h-5 w-5 text-yellow-500" />
              <Input type="number" readOnly value={diffData.modified} className="flex-1" />
              <Button variant="outline" size="icon" onClick={() => handleCountChange('modified', -1)}><Minus className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => handleCountChange('modified', 1)}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">詳細な変更リスト</h2>
          <ul className="space-y-2 rounded-md border p-4">
            {diffData.changes.map((change, index) => (
              <li key={index} className="flex justify-between rounded-md bg-muted p-2">
                <span>{change.itemName} - <span className="capitalize">{change.changeType}</span></span>
                <span>前: {change.previousCount}, 今: {change.currentCount}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="mt-8 w-full py-6 text-lg">
          {isSaving ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : '保存'}
        </Button>
      </div>
    </div>
  );
}
