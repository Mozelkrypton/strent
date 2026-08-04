-- CreateEnum
CREATE TYPE "AdminLevel" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminLevel" "AdminLevel",
ADD COLUMN     "region" TEXT;
