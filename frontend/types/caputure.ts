export interface Capture {
  id: string;
  locationId: string;
  imageUrl: string;
  date: Date;
  analyzed: boolean;
  diffResponse?: DiffResponse; // 解析結果を含めるオプションのフィールド
}