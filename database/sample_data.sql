-- Users
INSERT INTO Users (username, email, password_hash, bio, profile_image_url, role)
VALUES
('Taha', 'taha@test.com', 'sigma67_lover', 'Indie sloper', 'Taha.jpg', 'USER'),
('Emren', 'emren@test.com', 'womenfearme', 'Hi guys!', 'Emren.jpg', 'DEVELOPER'),
('Joel', 'joel@test.com', 'frontendfull', 'Admin of this page', 'Joel.jpg', 'ADMIN'),
('Berk', 'berk@test.com', 'helloguys', 'I like puzzles', 'Berk.jpg', 'USER'),
('Ömer', 'ömer@test.com', 'ilvposgre', 'I hope I will never study again', 'Ömer.jpg', 'USER'),
('Ali', 'ali@test.com', 'JaxLover', 'I love bbno$', 'Ali.jpg', 'USER');

-- DeveloperProfiles
INSERT INTO DeveloperProfiles (user_id, studio_name)
VALUES
(2, 'Indie Studio');

-- Games
INSERT INTO Games
(name, description, price, developer_user_id, release_date, cover_image_url)
VALUES
('Hollow Knight', 'Scifi adventure', 39.99, 2, '2025-06-07', 'knight.jpg'),
('Dungeon Escape', 'Roguelike dungeon crawler', 24.00, 2, '2024-09-16', 'dungeonescape.jpg');


-- Genres
INSERT INTO Genres (genre_name)
VALUES
('Action'),
('Roguelike'),
('Dungeon'),
('Horror');

-- GameGenres
INSERT INTO GameGenres (game_id, genre_id)
VALUES
(1, 1),
(1, 2),
(2, 2),
(2, 3);

-- Wishlists
INSERT INTO Wishlists (user_id, game_id)
VALUES
(1, 1),
(1, 2);

-- Purchases
INSERT INTO Purchases (user_id, total_price, payment_method)
VALUES
(1, 34.98, 'CARD');

-- PurchaseItems
INSERT INTO PurchaseItems (purchase_id, game_id, price_at_purchase)
VALUES
(1, 1, 19.99),
(1, 2, 14.99);

-- Library
INSERT INTO Library (user_id, game_id, purchase_id, hours_played)
VALUES
(1, 1, 1, 25),
(1, 2, 1, 10);

-- Reviews
INSERT INTO Reviews (user_id, game_id, rating, comment)
VALUES
(1, 1, 5, 'Great great game, I played it like 10 hours'),
(1, 2, 1, 'Absolute dog shit who is making this game');

-- Favorites
INSERT INTO Favorites (user_id, game_id)
VALUES
(1, 1);

-- Gifts
INSERT INTO Gifts
(sender_user_id, recipient_user_id, game_id, gift_message, status)
VALUES
(1, 2, 1, 'Enjoy this wonderful experience dear friendooo!', 'ACCEPTED');
