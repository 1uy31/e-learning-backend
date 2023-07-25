-- Verify e-learning-backend:7_note_fields_modification on pg

BEGIN;

SELECT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA='e_learning_schema' AND TABLE_NAME='note' AND COLUMN_NAME='file_path'
);

ROLLBACK;
