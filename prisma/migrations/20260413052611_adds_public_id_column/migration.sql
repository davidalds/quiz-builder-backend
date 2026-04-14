/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_publicId_key" ON "Quiz"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");
