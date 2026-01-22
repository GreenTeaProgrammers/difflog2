import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

function parseLocationId(value: string) {
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

  const locationId = parseLocationId(params.id);
  if (!locationId) {
    return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
  }

  const location = await prisma.location.findFirst({
    where: { id: locationId, userId },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json(location);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const locationId = parseLocationId(params.id);
  if (!locationId) {
    return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
  }

  let payload: { name?: unknown; description?: unknown };
  try {
    payload = (await request.json()) as { name?: unknown; description?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : null;
  const description =
    typeof payload.description === "string" ? payload.description.trim() : null;

  if (!name && description === null) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const existing = await prisma.location.findFirst({
    where: { id: locationId, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const updated = await prisma.location.update({
    where: { id: locationId },
    data: {
      ...(name ? { name } : {}),
      ...(description !== null ? { description } : {}),
    },
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

  const locationId = parseLocationId(params.id);
  if (!locationId) {
    return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
  }

  const existing = await prisma.location.findFirst({
    where: { id: locationId, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  await prisma.location.delete({ where: { id: locationId } });
  return NextResponse.json({ ok: true });
}
