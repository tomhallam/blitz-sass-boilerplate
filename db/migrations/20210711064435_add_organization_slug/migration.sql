/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT E'';

-- CreateIndex
CREATE UNIQUE INDEX "Organization.slug_unique" ON "Organization"("slug");
