import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

const changeTypes = new Set(["ADDED", "MODIFIED", "DELETED"]);

type ItemPayload = {
  itemName?: unknown;
  changeType?: unknown;
  previousCount?: unknown;
  currentCount?: unknown;
  confidence?: unknown;
};

type CommitPayload = {
  captureId?: unknown;
  items?: unknown;
  beforeItems?: unknown;
  afterItems?: unknown;
  note?: unknown;
  status?: unknown;
  source?: unknown;
  rawInference?: unknown;
};

function parseItem(input: ItemPayload) {
  const itemName = typeof input.itemName === "string" ? input.itemName.trim() : "";
  const changeType = typeof input.changeType === "string" ? input.changeType : "";
  const previousCount = Number(input.previousCount);
  const currentCount = Number(input.currentCount);
  const confidence =
    typeof input.confidence === "number" ? input.confidence : null;

  if (!itemName) {
    return null;
  }

  if (!changeTypes.has(changeType)) {
    return null;
  }

  if (!Number.isFinite(previousCount) || !Number.isFinite(currentCount)) {
    return null;
  }

  return {
    itemName,
    changeType,
    previousCount: Math.max(0, Math.floor(previousCount)),
    currentCount: Math.max(0, Math.floor(currentCount)),
    confidence,
  };
}

function parseItems(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }
  const parsed = value
    .map((item) => parseItem(item as ItemPayload))
    .filter(Boolean);
  return parsed.length === value.length ? parsed : null;
}

function parseLocationId(value: string | null) {
  if (!value) {
    return null;
  }
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

function parseDateParam(value: string | null) {
  if (!value) {
    return null;
  }
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) {
    return null;
  }
  const start = new Date(Date.UTC(year, month - 1, day));
  const end = new Date(Date.UTC(year, month - 1, day + 1));
  return {
    key: value,
    start,
    end,
  };
}

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const locationId = parseLocationId(searchParams.get("locationId"));
  const dateParam = parseDateParam(searchParams.get("date"));

  if (!locationId) {
    return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
  }

  if (!dateParam) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const location = await prisma.location.findFirst({
    where: { id: locationId, userId },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const commits = await prisma.commit.findMany({
    where: {
      locationId,
      createdAt: {
        gte: dateParam.start,
        lt: dateParam.end,
      },
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const itemMap = new Map<
    string,
    {
      itemName: string;
      previousCount: number;
      currentCount: number;
      changeTypes: Record<string, number>;
    }
  >();

  for (const commit of commits) {
    for (const item of commit.items) {
      const existing = itemMap.get(item.itemName) ?? {
        itemName: item.itemName,
        previousCount: 0,
        currentCount: 0,
        changeTypes: {
          ADDED: 0,
          MODIFIED: 0,
          DELETED: 0,
        },
      };
      existing.previousCount += item.previousCount;
      existing.currentCount += item.currentCount;
      existing.changeTypes[item.changeType] =
        (existing.changeTypes[item.changeType] ?? 0) + 1;
      itemMap.set(item.itemName, existing);
    }
  }

  const items = Array.from(itemMap.values()).sort((a, b) =>
    a.itemName.localeCompare(b.itemName)
  );

  return NextResponse.json({
    date: dateParam.key,
    locationId,
    commitCount: commits.length,
    items,
  });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: CommitPayload;
  try {
    payload = (await request.json()) as CommitPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const captureId =
    typeof payload.captureId === "number"
      ? payload.captureId
      : Number(payload.captureId);
  if (!Number.isInteger(captureId)) {
    return NextResponse.json({ error: "Invalid capture id" }, { status: 400 });
  }

  const items = parseItems(payload.items);
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Items are required" }, { status: 400 });
  }

  const capture = await prisma.capture.findFirst({
    where: { id: captureId },
    include: { location: true },
  });

  if (!capture || capture.location.userId !== userId) {
    return NextResponse.json({ error: "Capture not found" }, { status: 404 });
  }

  const existingCommit = await prisma.commit.findUnique({
    where: { captureId },
  });
  if (existingCommit) {
    return NextResponse.json({ error: "Commit already exists" }, { status: 409 });
  }

  const status = payload.status === "DRAFT" ? "DRAFT" : "CONFIRMED";
  const source = typeof payload.source === "string" ? payload.source : "manual";
  const note = typeof payload.note === "string" ? payload.note : null;

  const beforeItems = parseItems(payload.beforeItems) ?? [];
  const afterItems = parseItems(payload.afterItems) ?? items;

  const commit = await prisma.$transaction(async (tx) => {
    const created = await tx.commit.create({
      data: {
        locationId: capture.locationId,
        captureId,
        status,
        source,
        rawInference: payload.rawInference ?? null,
        items: {
          create: items,
        },
        edits: {
          create: {
            editorId: userId,
            beforeItems,
            afterItems,
            note,
          },
        },
      },
      include: {
        items: true,
      },
    });

    await tx.capture.update({
      where: { id: captureId },
      data: {
        analysisStatus: "ANALYZED",
        analyzedAt: new Date(),
      },
    });

    return created;
  });

  return NextResponse.json(commit, { status: 201 });
}
