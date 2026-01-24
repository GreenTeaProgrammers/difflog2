import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const locations = await prisma.location.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (locations.length === 0) {
    return NextResponse.json([]);
  }

  const locationIds = locations.map((location) => location.id);
  const captures = await prisma.capture.findMany({
    where: { locationId: { in: locationIds } },
    orderBy: { capturedAt: "desc" },
    select: { locationId: true, imageUrl: true, capturedAt: true },
  });

  const coverMap = new Map<number, { imageUrl: string; capturedAt: Date }>();
  for (const capture of captures) {
    if (!coverMap.has(capture.locationId)) {
      coverMap.set(capture.locationId, {
        imageUrl: capture.imageUrl,
        capturedAt: capture.capturedAt,
      });
    }
  }

  return NextResponse.json(
    locations.map((location) => ({
      ...location,
      coverImageUrl: coverMap.get(location.id)?.imageUrl ?? null,
    }))
  );
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { name?: unknown; description?: unknown };
  try {
    payload = (await request.json()) as { name?: unknown; description?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const description =
    typeof payload.description === "string" ? payload.description.trim() : null;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const location = await prisma.location.create({
    data: {
      userId,
      name,
      description,
    },
  });

  return NextResponse.json(location, { status: 201 });
}
