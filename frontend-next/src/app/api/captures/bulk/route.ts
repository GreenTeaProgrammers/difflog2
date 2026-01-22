import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

type BulkCapturePayload = {
  captureIds?: unknown;
  action?: unknown;
  targetLocationId?: unknown;
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

  let payload: BulkCapturePayload;
  try {
    payload = (await request.json()) as BulkCapturePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const captureIds = parseIds(payload.captureIds);
  const action = typeof payload.action === "string" ? payload.action : "";

  if (!captureIds || captureIds.length === 0) {
    return NextResponse.json({ error: "captureIds are required" }, { status: 400 });
  }

  if (captureIds.length > 100) {
    return NextResponse.json({ error: "Too many captureIds" }, { status: 400 });
  }

  if (action !== "delete" && action !== "move") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const captures = await prisma.capture.findMany({
    where: {
      id: { in: captureIds },
      location: {
        userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (captures.length !== captureIds.length) {
    return NextResponse.json({ error: "Capture not found" }, { status: 404 });
  }

  if (action === "delete") {
    await prisma.capture.deleteMany({
      where: { id: { in: captureIds } },
    });
    return NextResponse.json({ ok: true });
  }

  const targetLocationId = Number(payload.targetLocationId);
  if (!Number.isInteger(targetLocationId)) {
    return NextResponse.json({ error: "Invalid target location id" }, { status: 400 });
  }

  const targetLocation = await prisma.location.findFirst({
    where: {
      id: targetLocationId,
      userId,
    },
  });
  if (!targetLocation) {
    return NextResponse.json({ error: "Target location not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.capture.updateMany({
      where: { id: { in: captureIds } },
      data: {
        locationId: targetLocationId,
      },
    });
    await tx.commit.updateMany({
      where: {
        captureId: { in: captureIds },
      },
      data: {
        locationId: targetLocationId,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
