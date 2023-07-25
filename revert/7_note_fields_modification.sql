-- Revert e-learning-backend:7_note_fields_modification from pg

BEGIN;

ALTER TABLE e_learning_schema.note ADD COLUMN image_url VARCHAR(256) NULL;
ALTER TABLE e_learning_schema.note DROP COLUMN content;]
ALTER TABLE e_learning_schema.note ADD COLUMN content TEXT NULL;

ALTER TABLE e_learning_schema.note DROP COLUMN file_path;

COMMIT;
