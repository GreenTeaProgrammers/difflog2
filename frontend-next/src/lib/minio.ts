import { Client } from "minio";

type UploadResult = {
  key: string;
  url: string;
  size: number;
  contentType: string | null;
};

let cachedClient: Client | null = null;

function getEnv(name: string, fallback?: string) {
  const value = process.env[name];
  if (value && value.length > 0) {
    return value;
  }
  return fallback;
}

function requireEnv(name: string) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildObjectKey(userId: number, locationId: number, filename: string) {
  const safeName = sanitizeFilename(filename || "capture");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `captures/${userId}/${locationId}/${timestamp}-${safeName}`;
}

function getMinioClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const endpoint = requireEnv("MINIO_ENDPOINT");
  const port = Number(getEnv("MINIO_PORT", "9000"));
  const useSSL = getEnv("MINIO_USE_SSL", "false") === "true";
  const accessKey = requireEnv("MINIO_ACCESS_KEY");
  const secretKey = requireEnv("MINIO_SECRET_KEY");

  cachedClient = new Client({
    endPoint: endpoint,
    port,
    useSSL,
    accessKey,
    secretKey,
  });

  return cachedClient;
}

function buildPublicUrl(bucket: string, key: string) {
  const baseUrl = getEnv("MINIO_PUBLIC_URL", "http://localhost:9000");
  return `${baseUrl?.replace(/\/$/, "")}/${bucket}/${key}`;
}

export async function uploadCaptureObject(params: {
  userId: number;
  locationId: number;
  file: File;
}) : Promise<UploadResult> {
  const bucket = requireEnv("MINIO_BUCKET");
  const client = getMinioClient();
  const key = buildObjectKey(params.userId, params.locationId, params.file.name);
  const contentType = params.file.type || "application/octet-stream";
  const buffer = Buffer.from(await params.file.arrayBuffer());

  await client.putObject(bucket, key, buffer, buffer.length, {
    "Content-Type": contentType,
  });

  return {
    key,
    url: buildPublicUrl(bucket, key),
    size: buffer.length,
    contentType: params.file.type || null,
  };
}
