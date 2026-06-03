-- Repair migration: Add managerId field and update enums
-- Safely handles enum changes and adds manager relationship

-- 1. Add PROJECT_MANAGER role to Role enum if not present
DO $$
BEGIN
  BEGIN
    ALTER TYPE "Role" ADD VALUE 'PROJECT_MANAGER' AFTER 'ADMIN';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 2. Add managerId column to Project table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Project' AND column_name='managerId') THEN
    ALTER TABLE "Project" ADD COLUMN "managerId" TEXT;
  END IF;
END $$;

-- 3. Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='Project' AND constraint_name='Project_managerId_fkey'
  ) THEN
    ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" 
    FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 4. Add missing values to ProjectStatus enum
DO $$
BEGIN
  BEGIN
    ALTER TYPE "ProjectStatus" ADD VALUE 'NEW_ENQUIRY' AFTER 'CANCELLED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "ProjectStatus" ADD VALUE 'CONTACTED' AFTER 'CANCELLED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "ProjectStatus" ADD VALUE 'SITE_VISITED' AFTER 'CANCELLED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "ProjectStatus" ADD VALUE 'ADVANCE_PAID' AFTER 'CANCELLED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "ProjectStatus" ADD VALUE 'QUALITY_CHECK' AFTER 'CANCELLED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "ProjectStatus" ADD VALUE 'FINAL_INVOICE' AFTER 'CANCELLED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "ProjectStatus" ADD VALUE 'CLOSED' AFTER 'CANCELLED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 5. Add missing values to EnquiryStatus enum
DO $$
BEGIN
  BEGIN
    ALTER TYPE "EnquiryStatus" ADD VALUE 'SITE_VISITED' AFTER 'CLOSED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "EnquiryStatus" ADD VALUE 'QUOTE_SENT' AFTER 'CLOSED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "EnquiryStatus" ADD VALUE 'CONFIRMED' AFTER 'CLOSED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "EnquiryStatus" ADD VALUE 'ADVANCE_PAID' AFTER 'CLOSED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "EnquiryStatus" ADD VALUE 'IN_PROGRESS' AFTER 'CLOSED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "EnquiryStatus" ADD VALUE 'QUALITY_CHECK' AFTER 'CLOSED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "EnquiryStatus" ADD VALUE 'FINAL_INVOICE' AFTER 'CLOSED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TYPE "EnquiryStatus" ADD VALUE 'COMPLETED' AFTER 'CLOSED';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
