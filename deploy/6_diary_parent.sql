-- Deploy e-learning-backend:6_diary_parent to pg
-- requires: 4_diary

BEGIN;

ALTER TABLE e_learning_schema.diary ADD parent_diary_id INTEGER NULL;
ALTER TABLE e_learning_schema.diary ADD
    CONSTRAINT diary_parent_diary_id_fkey FOREIGN KEY (parent_diary_id) REFERENCES e_learning_schema.diary(id) ON DELETE
    CASCADE;

COMMIT;
