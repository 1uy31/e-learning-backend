-- Verify e-learning-backend:diary_parent on pg

BEGIN;

SELECT *
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_NAME='diary_parent_diary_id_fkey';

ROLLBACK;
