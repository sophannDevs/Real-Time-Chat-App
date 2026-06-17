-- ============================================================
-- ChatApp Database Schema
-- Run this file in psql or pgAdmin to set up the database:
--   psql -U postgres -d chatapp -f schema.sql
-- ============================================================

-- Create the database (run this separately as a superuser if needed):
-- CREATE DATABASE chatapp;

-- ============================================================
-- USERS TABLE
-- Stores account info for every registered user.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,       -- bcrypt hash, never store plain text
    created_at    TIMESTAMPTZ  DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- Speed up login queries that look up by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- MESSAGES TABLE
-- Stores every chat message with a reference to the sender.
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT     NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Speed up "load last N messages" queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_id    ON messages(user_id);
