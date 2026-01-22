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

function parseYear(value: string | null) {
  if (!value) {
    return new Date().getUTCFullYear();
  }
  const year = Number(value);
  return Number.isInteger(year) ? year : null;
}

function formatDateKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const locationId = parseLocationId(searchParams.get("locationId"));
  const year = parseYear(searchParams.get("year"));

  if (!locationId) {
    return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
  }

  if (!year) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const location = await prisma.location.findFirst({
    where: { id: locationId, userId },
  });
  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const commits = await prisma.commit.findMany({
    where: {
      locationId,
      status: "CONFIRMED",
      createdAt: {
        gte: start,
        lt: end,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const days: Record<string, number> = {};
  for (const commit of commits) {
    const key = formatDateKey(commit.createdAt);
    days[key] = (days[key] ?? 0) + 1;
  }

  return NextResponse.json({
    locationId,
    year,
    days,
  });
}
