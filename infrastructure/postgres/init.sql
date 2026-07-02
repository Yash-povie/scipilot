CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50));
CREATE TABLE documents (id SERIAL PRIMARY KEY, title VARCHAR(100));
CREATE TABLE chunks (id SERIAL PRIMARY KEY, document_id INT, embedding vector(1536));
CREATE TABLE research_sessions (id SERIAL PRIMARY KEY, user_id INT);
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops);
