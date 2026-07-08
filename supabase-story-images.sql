-- Assign generic Ceefax graphics to the existing stories.
-- Run this in the Supabase SQL editor:
--   https://supabase.com/dashboard/project/exmksuzyfbhfybzoxfsg/sql/new
-- (These files live in public/images/graphics/. You can change any story's
--  image later from the admin panel's "Story Image" dropdown.)

UPDATE ceefax_stories SET image_url = '/images/graphics/money.svg'      WHERE page_number = 101; -- indie funding
UPDATE ceefax_stories SET image_url = '/images/graphics/leaf.svg'       WHERE page_number = 102; -- carbon emissions
UPDATE ceefax_stories SET image_url = '/images/graphics/book.svg'       WHERE page_number = 103; -- game dev course
UPDATE ceefax_stories SET image_url = '/images/graphics/building.svg'   WHERE page_number = 104; -- studio opens
UPDATE ceefax_stories SET image_url = '/images/graphics/book.svg'       WHERE page_number = 105; -- games academy
UPDATE ceefax_stories SET image_url = '/images/graphics/controller.svg' WHERE page_number = 106; -- new game studio
UPDATE ceefax_stories SET image_url = '/images/graphics/growth.svg'     WHERE page_number = 107; -- team expansion
UPDATE ceefax_stories SET image_url = '/images/graphics/money.svg'      WHERE page_number = 108; -- government fund
UPDATE ceefax_stories SET image_url = '/images/graphics/trophy.svg'     WHERE page_number = 109; -- BAFTA awards
UPDATE ceefax_stories SET image_url = '/images/graphics/growth.svg'     WHERE page_number = 110; -- industry booming
UPDATE ceefax_stories SET image_url = '/images/graphics/person.svg'     WHERE page_number = 111; -- new appointment
