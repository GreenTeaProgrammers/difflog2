import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

function parseCaptureId(value: string) {
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

  const captureId = parseCaptureId(params.id);
  if (!captureId) {
    return NextResponse.json({ error: "Invalid capture id" }, { status: 400 });
  }

  const capture = await prisma.capture.findFirst({
    where: {
      id: captureId,
      location: {
        userId,
      },
    },
    include: {
      location: true,
      commit: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!capture) {
    return NextResponse.json({ error: "Capture not found" }, { status: 404 });
  }

  return NextResponse.json(capture);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const captureId = parseCaptureId(params.id);
  if (!captureId) {
    return NextResponse.json({ error: "Invalid capture id" }, { status: 400 });
  }

  const capture = await prisma.capture.findFirst({
    where: {
      id: captureId,
      location: {
        userId,
      },
    },
  });

  if (!capture) {
    return NextResponse.json({ error: "Capture not found" }, { status: 404 });
  }

  await prisma.capture.delete({
    where: { id: capture.id },
  });

  return NextResponse.json({ ok: true });
}
