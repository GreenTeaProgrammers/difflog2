import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

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
  const limit = parseLimit(searchParams.get("limit"));
  const query = searchParams.get("q")?.trim() ?? "";

  if (!limit) {
    return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
  }

  const items = await prisma.commitItem.findMany({
    where: {
      commit: {
        location: {
          userId,
        },
      },
      ...(query
        ? {
            itemName: {
              contains: query,
              mode: "insensitive",
            },
          }
        : {}),
    },
    distinct: ["itemName"],
    select: {
      itemName: true,
    },
    orderBy: {
      itemName: "asc",
    },
    take: limit,
  });

  return NextResponse.json({
    items: items.map((item) => item.itemName),
  });
}
