'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDetectionStore } from '@/store/detection-store';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function ResultPageForm() {
  const router = useRouter();
  const { detectionResults, uploadedImageUrl } = useDetectionStore();
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageRef.current) {
      const { clientWidth, clientHeight } = imageRef.current;
      setImageSize({ width: clientWidth, height: clientHeight });
    }
  }, [uploadedImageUrl]);

  const handleRetry = () => {
    router.push('/camera');
  };

  if (!uploadedImageUrl) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
        <p>画像がアップロードされていません。再度お試しください。</p>
        <Button onClick={handleRetry} className="mt-4">
          アップロード画面に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="ml-4 text-xl font-semibold">解析結果</h1>
      </header>
      <main className="flex-1 overflow-auto p-4">
        <div className="relative mx-auto max-w-full" style={{ width: 'fit-content' }}>
          <img
            ref={imageRef}
            src={uploadedImageUrl}
            alt="Uploaded"
            className="max-h-[70vh] w-auto"
            onLoad={() => {
              if (imageRef.current) {
                const { clientWidth, clientHeight } = imageRef.current;
                setImageSize({ width: clientWidth, height: clientHeight });
              }
            }}
          />
          {imageSize.width > 0 && detectionResults.map((result, index) => {
            const originalWidth = imageRef.current?.naturalWidth ?? 1;
            const originalHeight = imageRef.current?.naturalHeight ?? 1;
            
            const scaleX = imageSize.width / originalWidth;
            const scaleY = imageSize.height / originalHeight;

            const [x1, y1, x2, y2] = result.bounding_box;
            const boxStyle = {
              left: `${x1 * scaleX}px`,
              top: `${y1 * scaleY}px`,
              width: `${(x2 - x1) * scaleX}px`,
              height: `${(y2 - y1) * scaleY}px`,
            };

            return (
              <div
                key={index}
                className="absolute border-2 border-red-500"
                style={boxStyle}
              >
                <span className="bg-red-500 text-white text-xs p-1">
                  {result.class} ({(result.confidence * 100).toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <Button onClick={handleRetry} className="px-8 py-6 text-lg">
            もう一度試す
          </Button>
        </div>
      </main>
    </div>
  );
}
