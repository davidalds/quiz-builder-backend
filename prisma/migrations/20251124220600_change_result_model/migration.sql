/*
  Warnings:

  - Made the column `questionId` on table `Answer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quizId` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Quiz` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_userId_fkey";

-- AlterTable
ALTER TABLE "Answer" ALTER COLUMN "questionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "quizId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Result" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
