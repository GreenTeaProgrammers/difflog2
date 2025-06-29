'use client';

import { useState, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useDetectionStore } from '@/store/detection-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient, ApiError } from '@/lib/api';

export function CameraUploadForm() {
  const router = useRouter();
  const { setDetectionResults, setUploadedImageUrl } = useDetectionStore();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
      setUploadedFile(file);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setError(null);

    const imageUrl = URL.createObjectURL(uploadedFile);
    setUploadedImageUrl(imageUrl);

    const formData = new FormData();
    formData.append('image', uploadedFile);

    try {
      const data = await apiClient<{ results: any[] }>('/detect', {
        method: 'POST',
        body: formData,
      });
      setDetectionResults(data.results);
      router.push('/result');
    } catch (error) {
      console.error('Error uploading capture:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('画像のアップロードに失敗しました。もう一度お試しください。');
      }
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
      <main className="flex flex-1 flex-col items-center justify-center p-4">
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
          disabled={!uploadedFile || isAnalyzing}
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
