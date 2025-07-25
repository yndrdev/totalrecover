-- TJV RECOVERY SCHEMA FIX
-- Fix for missing tenant_type column

-- Check if tenant_type column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'tenant_type'
    ) THEN
        ALTER TABLE tenants ADD COLUMN tenant_type TEXT DEFAULT 'practice' 
        CHECK (tenant_type IN ('super_admin', 'practice', 'clinic'));
        
        RAISE NOTICE 'Added tenant_type column to tenants table';
    ELSE
        RAISE NOTICE 'tenant_type column already exists';
    END IF;
END $$;

-- Check if parent_tenant_id column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'parent_tenant_id'
    ) THEN
        ALTER TABLE tenants ADD COLUMN parent_tenant_id UUID REFERENCES tenants(id);
        
        RAISE NOTICE 'Added parent_tenant_id column to tenants table';
    ELSE
        RAISE NOTICE 'parent_tenant_id column already exists';
    END IF;
END $$;

-- Updated seed demo data function
CREATE OR REPLACE FUNCTION seed_demo_data()
RETURNS VOID AS $$
DECLARE
  super_admin_tenant_id UUID;
  practice_tenant_id UUID;
  clinic_tenant_id UUID;
BEGIN
  -- Create super admin tenant
  INSERT INTO tenants (name, subdomain, tenant_type)
  VALUES ('TJV Recovery Super Admin', 'super-admin', 'super_admin')
  RETURNING id INTO super_admin_tenant_id;
  
  -- Create practice tenant
  INSERT INTO tenants (name, subdomain, tenant_type, parent_tenant_id)
  VALUES ('TJV Orthopedic Center', 'tjv-ortho', 'practice', super_admin_tenant_id)
  RETURNING id INTO practice_tenant_id;
  
  -- Create clinic tenant
  INSERT INTO tenants (name, subdomain, tenant_type, parent_tenant_id)
  VALUES ('TJV Main Clinic', 'tjv-main', 'clinic', practice_tenant_id)
  RETURNING id INTO clinic_tenant_id;
  
  RAISE NOTICE 'Demo tenants created successfully';
  RAISE NOTICE 'Super Admin Tenant ID: %', super_admin_tenant_id;
  RAISE NOTICE 'Practice Tenant ID: %', practice_tenant_id;
  RAISE NOTICE 'Clinic Tenant ID: %', clinic_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Now run the demo data seeding
SELECT seed_demo_data();

