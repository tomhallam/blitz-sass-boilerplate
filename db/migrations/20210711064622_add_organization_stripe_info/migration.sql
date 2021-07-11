/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "price" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT DEFAULT E'incomplete';

-- CreateIndex
CREATE UNIQUE INDEX "Organization.stripeCustomerId_unique" ON "Organization"("stripeCustomerId");
