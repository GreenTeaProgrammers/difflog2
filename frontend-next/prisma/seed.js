const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function buildImageUrl(bucket, key) {
  const baseUrl = process.env.MINIO_PUBLIC_URL || "http://localhost:9000";
  return `${baseUrl.replace(/\/$/, "")}/${bucket}/${key}`;
}

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const bucket = process.env.MINIO_BUCKET || "difflog";

  await prisma.commitEdit.deleteMany();
  await prisma.commitItem.deleteMany();
  await prisma.commit.deleteMany();
  await prisma.capture.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  const users = [];
  for (const data of [
    { username: "alice", email: "alice@example.com" },
    { username: "bob", email: "bob@example.com" },
  ]) {
    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash: hashedPassword,
      },
    });
    users.push(user);
  }

  const locations = [];
  const locationSeeds = [
    { user: users[0], name: "desk", description: "Home workspace" },
    { user: users[0], name: "kitchen", description: "Cooking station" },
    { user: users[1], name: "studio", description: "Creative space" },
    { user: users[1], name: "garage", description: "Tool storage" },
  ];

  for (const seed of locationSeeds) {
    const location = await prisma.location.create({
      data: {
        userId: seed.user.id,
        name: seed.name,
        description: seed.description,
      },
    });
    locations.push(location);
  }

  const baseTime = new Date("2024-11-09T12:24:00Z");

  for (const [index, location] of locations.entries()) {
    const captureKey = `seed/${location.id}/capture-${index + 1}.jpg`;
    const analyzedAt = new Date(baseTime.getTime() + index * 3600 * 1000);

    const analyzedCapture = await prisma.capture.create({
      data: {
        locationId: location.id,
        imageKey: captureKey,
        imageUrl: buildImageUrl(bucket, captureKey),
        contentType: "image/jpeg",
        fileSize: 150000 + index * 1000,
        capturedAt: analyzedAt,
        analysisStatus: "ANALYZED",
        analyzedAt,
      },
    });

    const pendingKey = `seed/${location.id}/pending-${index + 1}.jpg`;
    await prisma.capture.create({
      data: {
        locationId: location.id,
        imageKey: pendingKey,
        imageUrl: buildImageUrl(bucket, pendingKey),
        contentType: "image/jpeg",
        fileSize: 120000 + index * 500,
        capturedAt: new Date(analyzedAt.getTime() + 1800 * 1000),
        analysisStatus: "PENDING",
      },
    });

    const commitItems = [
      {
        itemName: "book",
        changeType: "ADDED",
        previousCount: 2 + index,
        currentCount: 3 + index,
        confidence: 0.76,
      },
      {
        itemName: "pen",
        changeType: "MODIFIED",
        previousCount: 4 + index,
        currentCount: 5 + index,
        confidence: 0.64,
      },
      {
        itemName: "cup",
        changeType: "DELETED",
        previousCount: 1 + index,
        currentCount: 0,
        confidence: 0.58,
      },
    ];

    const beforeItems = commitItems.map((item) => ({
      ...item,
      currentCount: Math.max(0, item.currentCount - 1),
    }));

    await prisma.commit.create({
      data: {
        locationId: location.id,
        captureId: analyzedCapture.id,
        status: "CONFIRMED",
        source: "seed",
        rawInference: {
          status: "disabled",
          note: "ML inference is currently deferred",
          items: commitItems,
        },
        items: {
          create: commitItems,
        },
        edits: {
          create: {
            editorId: location.userId,
            beforeItems,
            afterItems: commitItems,
            note: "Seeded manual adjustment",
          },
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
