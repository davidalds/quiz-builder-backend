-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('PUBLICO', 'PRIVADO', 'NAO_LISTADO');

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "status" "QuizStatus" NOT NULL DEFAULT 'PUBLICO';
