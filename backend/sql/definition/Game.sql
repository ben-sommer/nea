CREATE TABLE IF NOT EXISTS Game (
  Id TEXT PRIMARY KEY,  
  User TEXT,
  Outcome TEXT,
  CompletedAt TIMESTAMP
);