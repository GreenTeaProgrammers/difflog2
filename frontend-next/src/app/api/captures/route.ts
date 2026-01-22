import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { uploadCaptureObject } from "@/lib/minio";

export const runtime = "nodejs";

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
