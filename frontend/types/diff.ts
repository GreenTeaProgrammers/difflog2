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

