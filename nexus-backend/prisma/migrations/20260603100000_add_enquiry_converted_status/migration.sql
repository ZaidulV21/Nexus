-- Add CONVERTED value to EnquiryStatus enum
DO $$
BEGIN
  BEGIN
    ALTER TYPE "EnquiryStatus" ADD VALUE 'CONVERTED' AFTER 'NEW';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
