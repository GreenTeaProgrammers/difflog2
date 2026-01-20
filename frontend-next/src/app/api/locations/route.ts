import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId() {
  const session = await getServerSession(authOptions);
  const rawId = session?.user?.id;
  const userId = rawId ? Number(rawId) : NaN;
  if (!Number.isInteger(userId)) {
    return null;
  }
  return userId;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const locations = await prisma.location.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(locations);
}

export async function POST(request: Request) {
  const userId = await getUserId();
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
