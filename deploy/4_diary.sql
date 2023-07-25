-- Deploy e-learning-backend:diary to pg
-- requires: category

BEGIN;

CREATE TABLE e_learning_schema.diary (
	id SERIAL4 NOT NULL,
	created_at TIMESTAMPTZ NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NULL,
	topic VARCHAR(1024) NOT NULL,
	source_url VARCHAR(256) NULL,
	review_count INT2 NULL DEFAULT 0,
	rate INT2 NULL,
	category_id INT4 NULL,
	CONSTRAINT diary_pkey PRIMARY KEY (id),
	CONSTRAINT diary_category_id_fkey FOREIGN KEY (category_id) REFERENCES e_learning_schema.category(id) ON DELETE RESTRICT,
	CONSTRAINT diary_category_id_topic_key UNIQUE (category_id, topic)
);

CREATE TRIGGER diary_auto_updated_at
    BEFORE UPDATE
    ON
        e_learning_schema.diary
    FOR EACH ROW
    EXECUTE PROCEDURE e_learning_schema.auto_updated_at_timestamp();

COMMIT;
