SELECT
    User,
    SUM(CASE WHEN Outcome = 'win' THEN 1 ELSE 0 END) as Wins,
    SUM(CASE WHEN Outcome = 'draw' THEN 1 ELSE 0 END) as Draws,
    SUM(CASE WHEN Outcome = 'loss' THEN 1 ELSE 0 END) as Losses
FROM Game
GROUP BY User