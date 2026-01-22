'use client';

import { useEffect, useState, DragEvent, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetcher } from '@/lib/fetcher';

type Location = {
  id: number;
  name: string;
};

export function CameraUploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const { data: locations, error: locationsError } = useSWR<Location[]>(
    '/api/locations',
    fetcher
  );

  useEffect(() => {
    if (!locations || locations.length === 0) {
      return;
    }

    const value = searchParams.get('locationId');
    const id = value ? Number(value) : Number.NaN;
    if (Number.isInteger(id) && locations.some((location) => location.id === id)) {
      setSelectedLocationId(id);
      return;
    }

    if (selectedLocationId === null) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, searchParams, selectedLocationId]);

  const maxFileSizeBytes = 10 * 1024 * 1024;
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

  const validateFile = (file: File) => {
    if (!allowedTypes.has(file.type)) {
      return '対応していない画像形式です。';
    }
    if (file.size > maxFileSizeBytes) {
      return '画像サイズが大きすぎます。10MB以下にしてください。';
    }
    return null;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setUploadedFile(null);
        return;
      }
      setUploadedFile(file);
      setError(null);
    }
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setUploadedFile(null);
        return;
      }
      setUploadedFile(file);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !selectedLocationId) {
      setError('ロケーションと画像を選択してください。');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('locationId', String(selectedLocationId));

      const response = await fetch('/api/captures', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload capture.');
      }

      router.push(`/result?captureId=${data.id}`);
    } catch (error) {
      console.error('Error uploading capture:', error);
      setError('画像のアップロードに失敗しました。もう一度お試しください。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="ml-4 text-xl font-semibold">画像アップロード</h1>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
        <div className="w-full max-w-lg space-y-2">
          <Label htmlFor="location-select">ロケーション</Label>
          {locationsError && (
            <p className="text-sm text-red-500">
              ロケーションの取得に失敗しました。
            </p>
          )}
          {!locationsError && locations && locations.length === 0 && (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              ロケーションがまだありません。
              <Button
                variant="link"
                className="px-1"
                onClick={() => router.push('/location')}
              >
                追加する
              </Button>
            </div>
          )}
          <select
            id="location-select"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedLocationId ?? ''}
            onChange={(event) =>
              setSelectedLocationId(Number(event.target.value))
            }
            disabled={!locations || locations.length === 0}
          >
            {locations?.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <Input
          accept="image/*"
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="flex w-full max-w-lg cursor-pointer flex-col items-center justify-center"
        >
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              'flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed',
              isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'
            )}
          >
            {uploadedFile ? (
              <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
            ) : (
              <UploadCloud className={cn('mb-4 h-16 w-16', isDragging ? 'text-primary' : 'text-muted-foreground')} />
            )}
            <p className="text-center text-muted-foreground">
              {uploadedFile ? `アップロード完了: ${uploadedFile.name}` : 'クリックまたはドラッグ＆ドロップで画像をアップロード'}
            </p>
          </div>
        </label>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        <Button
          onClick={handleAnalyze}
          disabled={!uploadedFile || !selectedLocationId || isAnalyzing}
          className="mt-6 px-8 py-6 text-lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              解析中...
            </>
          ) : (
            '解析！'
          )}
        </Button>
      </main>
    </div>
  );
}
