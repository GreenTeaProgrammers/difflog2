export type ChangeType = "ADDED" | "MODIFIED" | "DELETED";

export type CommitItemInput = {
  itemName?: unknown;
  changeType?: unknown;
  previousCount?: unknown;
  currentCount?: unknown;
  confidence?: unknown;
};

export type CommitItemPayload = {
  itemName: string;
  changeType: ChangeType;
  previousCount: number;
  currentCount: number;
  confidence: number | null;
};

const changeTypes = new Set<ChangeType>(["ADDED", "MODIFIED", "DELETED"]);

export function isValidCommitItemCounts(params: {
  changeType: ChangeType;
  previousCount: number;
  currentCount: number;
}) {
  const { changeType, previousCount, currentCount } = params;
  if (!Number.isFinite(previousCount) || !Number.isFinite(currentCount)) {
    return false;
  }
  if (previousCount < 0 || currentCount < 0) {
    return false;
  }
  switch (changeType) {
    case "ADDED":
      return previousCount === 0 && currentCount > 0;
    case "DELETED":
      return previousCount > 0 && currentCount === 0;
    case "MODIFIED":
      return previousCount > 0 && currentCount > 0 && previousCount !== currentCount;
    default:
      return false;
  }
}

function parseItem(input: CommitItemInput): CommitItemPayload | null {
  const itemName = typeof input.itemName === "string" ? input.itemName.trim() : "";
  const changeType = typeof input.changeType === "string" ? input.changeType : "";
  const previousCount = Number(input.previousCount);
  const currentCount = Number(input.currentCount);
  const confidence =
    typeof input.confidence === "number" ? input.confidence : null;

  if (!itemName) {
    return null;
  }

  if (!changeTypes.has(changeType as ChangeType)) {
    return null;
  }

  if (!Number.isFinite(previousCount) || !Number.isFinite(currentCount)) {
    return null;
  }

  const normalized = {
    itemName,
    changeType: changeType as ChangeType,
    previousCount: Math.max(0, Math.floor(previousCount)),
    currentCount: Math.max(0, Math.floor(currentCount)),
    confidence,
  };

  if (!isValidCommitItemCounts(normalized)) {
    return null;
  }

  return normalized;
}

export function parseCommitItems(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }
  const parsed = value
    .map((item) => parseItem(item as CommitItemInput))
    .filter(Boolean);
  return parsed.length === value.length ? parsed : null;
}
