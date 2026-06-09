-- Show all users
SELECT * 
FROM Users;

-- Show all games
SELECT * 
FROM Games;

-- Show all genres
SELECT * 
FROM Genres;

-- Show developers and their studios
SELECT u.username, d.studio_name
FROM DeveloperProfiles d
JOIN Users u ON d.user_id = u.user_id;

-- Show games with their developers
SELECT g.name, u.username AS developer
FROM Games g
JOIN DeveloperProfiles d ON g.developer_user_id = d.user_id
JOIN Users u ON d.user_id = u.user_id;

-- Show all games and genres
SELECT g.name, ge.genre_name
FROM GameGenres GG
JOIN Games g ON GG.game_id = g.game_id
JOIN Genres ge ON GG.genre_id = ge.genre_id
ORDER BY g.name;

-- Show all wishlists
SELECT u.username, g.name
FROM Wishlists w
JOIN Users u ON w.user_id = u.user_id
JOIN Games g ON w.game_id = g.game_id;

-- Show all purchases
SELECT p.purchase_id, u.username, p.total_price
FROM Purchases p
JOIN Users u ON p.user_id = u.user_id;

-- Show all purchased games
SELECT u.username, g.name, pi.price_at_purchase
FROM PurchaseItems pi
JOIN Purchases p ON pi.purchase_id = p.purchase_id
JOIN Users u ON p.user_id = u.user_id
JOIN Games g ON pi.game_id = g.game_id;

-- Show all library contents
SELECT u.username, g.name, l.hours_played
FROM Library l
JOIN Users u ON l.user_id = u.user_id
JOIN Games g ON l.game_id = g.game_id;

-- Show all reviews
SELECT u.username, g.name, r.rating, r.comment
FROM Reviews r
JOIN Users u ON r.user_id = u.user_id
JOIN Games g ON r.game_id = g.game_id;

-- Show all favorites
SELECT u.username, g.name
FROM Favorites f
JOIN Users u ON f.user_id = u.user_id
JOIN Games g ON f.game_id = g.game_id;

-- Show all gifts
SELECT
    sender.username AS sender,
    recipient.username AS recipient,
    g.name AS game,
    gf.status
FROM Gifts gf
JOIN Users sender ON gf.sender_user_id = sender.user_id
JOIN Users recipient ON gf.recipient_user_id = recipient.user_id
JOIN Games g ON gf.game_id = g.game_id;


-- Test all user bios
SELECT user_id, username, bio
FROM Users;

-- Test all gift messages
SELECT
    sender.username AS sender,
    recipient.username AS recipient,
    g.name AS game, 
    gf.gift_message, gf.status
FROM Gifts gf
JOIN Users sender ON gf.sender_user_id = sender.user_id
JOIN Users recipient ON gf.recipient_user_id = recipient.user_id
JOIN Games g ON gf.game_id = g.game_id;


-- Show all users and their wishlisted games
SELECT u.username, u.bio, g.name AS wishlisted_game
FROM Users u
JOIN Wishlists w ON u.user_id = w.user_id
JOIN Games g ON w.game_id = g.game_id;