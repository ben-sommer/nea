UPDATE 
  User 
SET 
  Token = : token, 
  TokenExpiry = : tokenExpiry 
WHERE 
  Username = : username;