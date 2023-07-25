-- Deploy e-learning-backend:category to pg
-- requires: auto-updated-at-timestamp

BEGIN;

SET client_min_messages = 'warning';

CREATE TABLE e_learning_schema.category (
    id SERIAL4 NOT NULL,
    created_at TIMESTAMPTZ NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NULL,
    name VARCHAR(256) NOT NULL,
    CONSTRAINT category_pkey PRIMARY KEY (id),
	CONSTRAINT category_name_key UNIQUE (name)
);

CREATE TRIGGER category_auto_updated_at
    BEFORE UPDATE
    ON
        e_learning_schema.category
    FOR EACH ROW
    EXECUTE PROCEDURE e_learning_schema.auto_updated_at_timestamp();

COMMIT;
