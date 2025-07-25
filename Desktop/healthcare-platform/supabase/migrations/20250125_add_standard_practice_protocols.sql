-- Add is_standard_practice column to protocols table
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS is_standard_practice BOOLEAN DEFAULT FALSE;

-- Create index for faster queries on standard practice protocols
CREATE INDEX IF NOT EXISTS idx_protocols_standard_practice ON protocols(is_standard_practice, tenant_id);

-- Update existing protocols to set default value
UPDATE protocols SET is_standard_practice = FALSE WHERE is_standard_practice IS NULL;

-- Add comment to the column
COMMENT ON COLUMN protocols.is_standard_practice IS 'Indicates if this protocol is marked as standard practice for automatic assignment';