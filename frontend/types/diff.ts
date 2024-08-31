export interface DiffItem {
  itemId: string;
  itemName: string;
  changeType: 'added' | 'deleted' | 'modified';
  previousCount: number;
  currentCount: number;
}

export interface Diff {
  id: string;
  locationId: string;
  date: Date;
  changes: DiffItem[];
}

export interface DiffResponse {
  added: number;
  deleted: number;
  modified: number;
  changes: DiffItem[];
}

export interface Capture {
  id: string;
  locationId: string;
  imageUrl: string;
  date: Date;
  analyzed: boolean;
  diffResponse?: DiffResponse; // 解析結果を含めるオプションのフィールド
}

export interface CommitData {
  locationID: string;
  date: string;
  diff: Diff;
}
