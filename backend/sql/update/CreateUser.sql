INSERT INTO
    User (Username, PasswordHash, FirstName, LastName, Token, TokenExpiry)
VALUES
    (:username, :passwordHash, :firstName, :lastName, :token, :tokenExpiry);