CREATE TABLE IF NOT EXISTS User (
  Username TEXT PRIMARY KEY,
  PasswordHash TEXT,
  FirstName TEXT,
  LastName TEXT,
  Token TEXT,
  TokenExpiry TIMESTAMP
);