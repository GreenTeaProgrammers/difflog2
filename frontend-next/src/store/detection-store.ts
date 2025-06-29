import { create } from 'zustand';

interface DetectionResult {
  bounding_box: number[];
  class: string;
  confidence: number;
}

interface DetectionState {
  detectionResults: DetectionResult[];
  uploadedImageUrl: string | null;
  setDetectionResults: (results: DetectionResult[]) => void;
  setUploadedImageUrl: (url: string) => void;
}

export const useDetectionStore = create<DetectionState>((set) => ({
  detectionResults: [],
  uploadedImageUrl: null,
  setDetectionResults: (results) => set({ detectionResults: results }),
  setUploadedImageUrl: (url) => set({ uploadedImageUrl: url }),
}));
