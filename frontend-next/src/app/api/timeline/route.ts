import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

const statusValues = new Set(["PENDING", "ANALYZED", "FAILED"]);

function parseLocationId(value: string | null) {
  if (!value) {
    return null;
  }
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

function parseLimit(value: string | null) {
  if (!value) {
    return 20;
  }
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit <= 0) {
    return null;
  }
  return Math.min(limit, 50);
}

function parseStatus(value: string | null) {
  if (!value) {
    return null;
  }
  return statusValues.has(value) ? value : null;
}

function parseHasCommit(value: string | null) {
  if (!value) {
    return null;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return null;
}

function encodeCursor(capturedAt: Date, id: number) {
  return Buffer.from(`${capturedAt.toISOString()}|${id}`).toString("base64");
}

function decodeCursor(value: string | null) {
  if (!value) {
    return null;
  }
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    const [dateValue, idValue] = decoded.split("|");
    if (!dateValue || !idValue) {
      return null;
    }
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    const id = Number(idValue);
    if (!Number.isInteger(id)) {
      return null;
    }
    return { capturedAt: date, id };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const locationId = parseLocationId(searchParams.get("locationId"));
  const limit = parseLimit(searchParams.get("limit"));
  const status = parseStatus(searchParams.get("status"));
  const hasCommit = parseHasCommit(searchParams.get("hasCommit"));
  const cursor = decodeCursor(searchParams.get("cursor"));

  if (!limit) {
    return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
  }

  if (searchParams.has("locationId") && !locationId) {
    return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
  }

  if (searchParams.has("status") && !status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (searchParams.has("hasCommit") && hasCommit === null) {
    return NextResponse.json({ error: "Invalid hasCommit value" }, { status: 400 });
  }

  if (cursor === null && searchParams.has("cursor")) {
    return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
  }

  if (locationId) {
    const location = await prisma.location.findFirst({
      where: { id: locationId, userId },
    });
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
  }

  const captures = await prisma.capture.findMany({
    where: {
      location: {
        userId,
      },
      ...(locationId ? { locationId } : {}),
      ...(status ? { analysisStatus: status } : {}),
      ...(hasCommit === null
        ? {}
        : hasCommit
          ? { commit: { isNot: null } }
          : { commit: { is: null } }),
      ...(cursor
        ? {
            OR: [
              { capturedAt: { lt: cursor.capturedAt } },
              {
                capturedAt: cursor.capturedAt,
                id: { lt: cursor.id },
              },
            ],
          }
        : {}),
    },
    orderBy: [
      {
        capturedAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    take: limit + 1,
    include: {
      location: {
        select: {
          id: true,
          name: true,
        },
      },
      commit: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  const hasMore = captures.length > limit;
  const items = hasMore ? captures.slice(0, limit) : captures;
  const nextCursor =
    hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].capturedAt, items[items.length - 1].id)
      : null;

  return NextResponse.json({
    items,
    nextCursor,
  });
}
