import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { uploadCaptureObject } from "@/lib/minio";

export const runtime = "nodejs";

const allowedContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const maxFileSizeBytes = 10 * 1024 * 1024;

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
  return Math.min(limit, 100);
}

function parseStatus(value: string | null) {
  if (!value) {
    return null;
  }
  return statusValues.has(value) ? value : null;
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

  if (searchParams.has("locationId") && !locationId) {
    return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
  }

  if (!limit) {
    return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
  }

  if (searchParams.has("status") && !status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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
      ...(locationId
        ? { locationId }
        : {
            location: {
              userId,
            },
          }),
      ...(status ? { analysisStatus: status } : {}),
    },
    orderBy: {
      capturedAt: "desc",
    },
    take: limit,
    include: {
      commit: {
        select: {
          id: true,
        },
      },
    },
  });

  return NextResponse.json(captures);
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const locationRaw = formData.get("locationId");
  const file = formData.get("image");
  const locationId =
    typeof locationRaw === "string" ? Number(locationRaw) : Number.NaN;

  if (!Number.isInteger(locationId)) {
    return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 });
  }

  if (!allowedContentTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  if (file.size > maxFileSizeBytes) {
    return NextResponse.json({ error: "Image is too large" }, { status: 400 });
  }

  const location = await prisma.location.findFirst({
    where: { id: locationId, userId },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const upload = await uploadCaptureObject({
    userId,
    locationId,
    file,
  });

  const capture = await prisma.capture.create({
    data: {
      locationId,
      imageKey: upload.key,
      imageUrl: upload.url,
      contentType: upload.contentType,
      fileSize: upload.size,
      capturedAt: new Date(),
      analysisStatus: "PENDING",
    },
  });

  return NextResponse.json(capture, { status: 201 });
}
