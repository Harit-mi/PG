-- Phase 1 Schema Updates

-- Rooms
ALTER TABLE rooms RENAME COLUMN rent_amount TO rent_per_bed;

-- Tenants
ALTER TABLE tenants ADD COLUMN permanent_address TEXT;
ALTER TABLE tenants ADD COLUMN father_mother_name TEXT;
ALTER TABLE tenants ADD COLUMN parent_contact_number TEXT;
ALTER TABLE tenants ADD COLUMN blood_group TEXT;
ALTER TABLE tenants ADD COLUMN workplace_details TEXT;

