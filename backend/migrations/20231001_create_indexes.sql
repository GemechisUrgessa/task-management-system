-- migrations/20231001_create_indexes.sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX task_search_idx ON task USING GIN ((
    setweight(to_tsvector('english', coalesce(title, '')), 'A') || 
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
));

CREATE INDEX task_trgm_idx ON task USING GIN (
    (title || ' ' || description) gin_trgm_ops
);