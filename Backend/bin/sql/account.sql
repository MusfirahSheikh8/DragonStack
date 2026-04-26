CREATE TABLE IF NOT EXISTS account (
    id               SERIAL PRIMARY KEY,
    "usernameHash"   CHARACTER (64),
    "passwordHash"   CHARACTER (64),
    "sessionId"      CHARACTER (36),
    balance          INTEGER NOT NULL
);

ALTER TABLE account
ADD COLUMN IF NOT EXISTS "sessionExpires" TIMESTAMP;

