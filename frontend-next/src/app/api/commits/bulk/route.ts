import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

type BulkCommitPayload = {
  commitIds?: unknown;
};

function parseIds(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }
  const ids = value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item));
  return ids.length === value.length ? ids : null;
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: BulkCommitPayload;
  try {
    payload = (await request.json()) as BulkCommitPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const commitIds = parseIds(payload.commitIds);
  if (!commitIds || commitIds.length === 0) {
    return NextResponse.json({ error: "commitIds are required" }, { status: 400 });
  }

  if (commitIds.length > 100) {
    return NextResponse.json({ error: "Too many commitIds" }, { status: 400 });
  }

  const commits = await prisma.commit.findMany({
    where: {
      id: { in: commitIds },
      location: {
        userId,
      },
    },
    select: {
      id: true,
      captureId: true,
    },
  });

  if (commits.length !== commitIds.length) {
    return NextResponse.json({ error: "Commit not found" }, { status: 404 });
  }

  const captureIds = commits.map((commit) => commit.captureId);

  await prisma.$transaction(async (tx) => {
    await tx.commit.deleteMany({
      where: { id: { in: commitIds } },
    });
    await tx.capture.updateMany({
      where: { id: { in: captureIds } },
      data: {
        analysisStatus: "PENDING",
        analyzedAt: null,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
