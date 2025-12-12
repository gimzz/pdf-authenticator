-- CreateTable
CREATE TABLE "singFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "signature" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "singFile_hash_key" ON "singFile"("hash");
