-- Make wardrobe-photos bucket public so images can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'wardrobe-photos';