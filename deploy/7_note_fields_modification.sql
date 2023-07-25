-- Deploy e-learning-backend:7_note_fields_modification to pg
-- requires: 5_note

BEGIN;

ALTER TABLE e_learning_schema.note DROP COLUMN image_url;
ALTER TABLE e_learning_schema.note DROP COLUMN content;
ALTER TABLE e_learning_schema.note ADD COLUMN content JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE e_learning_schema.note ADD COLUMN file_path VARCHAR(256) NULL;

COMMIT;
