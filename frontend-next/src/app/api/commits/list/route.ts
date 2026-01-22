import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

function parseLocationId(value: string | null) {
  if (!value) {
    return null;
  }
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

function parseLimit(value: string | null) {
  if (!value) {
    return 50;
  }
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit <= 0) {
    return null;
  }
  return Math.min(limit, 200);
}

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const locationId = parseLocationId(searchParams.get("locationId"));
  const limit = parseLimit(searchParams.get("limit"));

  if (!limit) {
    return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
  }

  if (searchParams.has("locationId") && !locationId) {
    return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
  }

  if (locationId) {
    const location = await prisma.location.findFirst({
      where: { id: locationId, userId },
    });
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
  }

  const commits = await prisma.commit.findMany({
    where: {
      ...(locationId
        ? { locationId }
        : {
            location: {
              userId,
            },
          }),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    select: {
      id: true,
      createdAt: true,
      status: true,
      locationId: true,
      location: {
        select: {
          name: true,
        },
      },
      capture: {
        select: {
          imageUrl: true,
          capturedAt: true,
        },
      },
    },
  });

  return NextResponse.json({ commits });
}
