-- Deploy e-learning-backend:note to pg
-- requires: diary

BEGIN;

CREATE TABLE e_learning_schema.note (
	id SERIAL4 NOT NULL,
	created_at TIMESTAMPTZ NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NULL,
	note_position INT2 NOT NULL,
	content TEXT NULL,
	image_url VARCHAR(256) NULL,
	source_url VARCHAR(256) NULL,
	diary_id INT4 NULL,
	CONSTRAINT note_pkey PRIMARY KEY (id),
	CONSTRAINT diary_id_note_position_key UNIQUE (diary_id, note_position),
	CONSTRAINT note_diary_id_fkey FOREIGN KEY (diary_id) REFERENCES e_learning_schema.diary(id) ON DELETE CASCADE
);

CREATE TRIGGER note_auto_updated_at
    BEFORE UPDATE
    ON
        e_learning_schema.note
    FOR EACH ROW
    EXECUTE PROCEDURE e_learning_schema.auto_updated_at_timestamp();

COMMIT;
