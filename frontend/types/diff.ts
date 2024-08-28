interface DiffItem {
  itemId: string;
  itemName: string;
  changeType: 'added' | 'deleted' | 'modified';
  previousCount: number;
  currentCount: number;
}

interface Diff {
  id: string;
  locationId: string;
  date: Date;
  changes: DiffItem[];
}

