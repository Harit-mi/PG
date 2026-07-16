-- 1. Drop the global unique constraint on rooms
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_room_number_key;

-- 2. Create a composite unique index on property_id and uppercase, trimmed room_number
CREATE UNIQUE INDEX IF NOT EXISTS rooms_property_room_number_uq 
ON public.rooms (property_id, UPPER(TRIM(room_number)));
