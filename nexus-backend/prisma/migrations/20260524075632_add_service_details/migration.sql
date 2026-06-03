-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "callbackTime" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "hearAboutUs" TEXT,
ADD COLUMN     "serviceDetails" JSONB;
