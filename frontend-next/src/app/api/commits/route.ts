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
