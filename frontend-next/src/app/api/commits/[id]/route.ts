import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { parseCommitItems } from "@/lib/commit-items";

export const runtime = "nodejs";

const statusValues = new Set(["DRAFT", "CONFIRMED"]);

function parseCommitId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commitId = parseCommitId(params.id);
  if (!commitId) {
    return NextResponse.json({ error: "Invalid commit id" }, { status: 400 });
  }

  const commit = await prisma.commit.findFirst({
    where: {
      id: commitId,
      location: {
        userId,
      },
    },
    include: {
      capture: true,
      items: true,
      edits: {
        orderBy: { createdAt: "desc" },
      },
      location: true,
    },
  });

  if (!commit) {
    return NextResponse.json({ error: "Commit not found" }, { status: 404 });
  }

  return NextResponse.json(commit);
}

type CommitUpdatePayload = {
  items?: unknown;
  status?: unknown;
  source?: unknown;
  note?: unknown;
  rawInference?: unknown;
};

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commitId = parseCommitId(params.id);
  if (!commitId) {
    return NextResponse.json({ error: "Invalid commit id" }, { status: 400 });
  }

  let payload: CommitUpdatePayload;
  try {
    payload = (await request.json()) as CommitUpdatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const items = parseCommitItems(payload.items);
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Items are required" }, { status: 400 });
  }

  const commit = await prisma.commit.findFirst({
    where: {
      id: commitId,
      location: {
        userId,
      },
    },
    include: {
      items: true,
      capture: true,
    },
  });

  if (!commit) {
    return NextResponse.json({ error: "Commit not found" }, { status: 404 });
  }

  const status =
    typeof payload.status === "string" && statusValues.has(payload.status)
      ? payload.status
      : commit.status;
  const source = typeof payload.source === "string" ? payload.source : commit.source;
  const note = typeof payload.note === "string" ? payload.note : null;

  const beforeItems = commit.items.map((item) => ({
    itemName: item.itemName,
    changeType: item.changeType,
    previousCount: item.previousCount,
    currentCount: item.currentCount,
    confidence: item.confidence,
  }));

  const updated = await prisma.$transaction(async (tx) => {
    await tx.commitItem.deleteMany({
      where: { commitId: commit.id },
    });

    const updatedCommit = await tx.commit.update({
      where: { id: commit.id },
      data: {
        status,
        source,
        rawInference: payload.rawInference ?? commit.rawInference,
        items: {
          create: items,
        },
        edits: {
          create: {
            editorId: userId,
            beforeItems,
            afterItems: items,
            note,
          },
        },
      },
      include: {
        items: true,
        edits: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    await tx.capture.update({
      where: { id: commit.captureId },
      data: {
        analysisStatus: status === "CONFIRMED" ? "ANALYZED" : "PENDING",
        analyzedAt:
          status === "CONFIRMED" ? commit.capture.analyzedAt ?? new Date() : null,
      },
    });

    return updatedCommit;
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commitId = parseCommitId(params.id);
  if (!commitId) {
    return NextResponse.json({ error: "Invalid commit id" }, { status: 400 });
  }

  const commit = await prisma.commit.findFirst({
    where: {
      id: commitId,
      location: {
        userId,
      },
    },
  });

  if (!commit) {
    return NextResponse.json({ error: "Commit not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.commit.delete({ where: { id: commit.id } });
    await tx.capture.update({
      where: { id: commit.captureId },
      data: {
        analysisStatus: "PENDING",
        analyzedAt: null,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
