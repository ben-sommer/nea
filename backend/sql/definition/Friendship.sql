CREATE TABLE IF NOT EXISTS Friendship (
  User1 TEXT,
  User2 TEXT,
  User1Confirmed BOOLEAN,
  User2Confirmed BOOLEAN,
  PRIMARY KEY (User1, User2),
  CONSTRAINT UsernameOrder CHECK (User1 < User2)
);