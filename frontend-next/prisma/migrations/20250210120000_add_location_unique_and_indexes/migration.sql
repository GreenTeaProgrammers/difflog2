-- CreateIndex
CREATE UNIQUE INDEX `Location_userId_name_key` ON `Location`(`userId`, `name`);

-- CreateIndex
CREATE INDEX `Capture_locationId_capturedAt_analysisStatus_idx` ON `Capture`(`locationId`, `capturedAt`, `analysisStatus`);

-- CreateIndex
CREATE INDEX `Commit_locationId_createdAt_status_idx` ON `Commit`(`locationId`, `createdAt`, `status`);
