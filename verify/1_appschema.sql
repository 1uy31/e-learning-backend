-- Verify e-learning-backend:1_appschema on pg

BEGIN;

-- Verify that the schema created correctly, not verifying any privilege.
-- To verify privilege: ASSERT (SELECT has_schema_privilege('e_learning_schema', 'usage'));
SELECT pg_catalog.has_schema_privilege('e_learning_schema', 'usage');

ROLLBACK;
