-- Users
INSERT INTO Users (username, email, password_hash, bio, profile_image_url, role)
VALUES
('Taha', 'taha@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Indie sloper', 'Taha.jpg', 'USER'), -- sigma67_lover
('Emren', 'emren@test.com', '$2b$10$RibqaKDCgQCDjVpV6ENhiOpnPKaA4RQHC25YYxEbvMEJJVQ6n7hE2', 'Hi guys!', 'Emren.jpg', 'DEVELOPER'), -- womenfearme
('Joel', 'joel@test.com', '$2b$10$gg/Mp1uOJDkx0xQ8hLWxGO.9H9KgFAlSNxuZFZKc3KywOXLDy/vZW', 'Admin of this page', 'Joel.jpg', 'ADMIN'), -- frontendfull
('Berk', 'berk@test.com', '$2b$10$uTZnrLoAeW1yjAbzhSQojenownIlwGMty3ym/Par.3KFSzsKfhxOe', 'I like puzzles', 'Berk.jpg', 'USER'), -- helloguys
('Ömer', 'ömer@test.com', '$2b$10$I5eO6wK/ZusRN13Y7C59w.65zfVaCBxo5g/URRP8tAqs90jdNiaIq', 'I hope I will never study again', 'Ömer.jpg', 'USER'), -- ilvposgre
('Ali', 'ali@test.com', '$2b$10$UIX7vHv.kF4cOjyFlnYpB.fGWeYMvYVBHM5yptoS0otNgA2DxAyNq', 'I love bbno$', 'Ali.jpg', 'USER'); -- JaxLover

-- DeveloperProfiles
INSERT INTO DeveloperProfiles (user_id, studio_name)
VALUES
(2, 'Indie Studio');

-- Games
INSERT INTO Games
(name, description, price, developer_user_id, release_date, cover_image_url)
VALUES
('Hollow Knight', 'Scifi adventure', 39.99, 2, '2025-06-07', 'knight.jpg'),
('Dungeon Escape', 'Roguelike dungeon crawler', 24.00, 2, '2024-09-16', 'dungeonescape.jpg'),
('Stellar Drift', 'Explore a procedurally generated universe with your own starship.', 29.99, 2, '2025-08-22', NULL),
('Nights of Terror', 'Survival horror set in an abandoned research facility.', 34.99, 2, '2025-10-31', NULL),
('Farmers Valley', 'Cozy farming simulator with crafting, relationships, and seasonal events.', 19.99, 2, '2024-09-12', NULL),
('Neon Drift', 'High-speed futuristic zero-G racing.', 0.00, 2, '2026-02-20', NULL),
('Ancient Mysteries', 'First-person puzzle adventure exploring forgotten temples.', 14.99, 2, '2025-05-15', NULL),
('Warzone Champions', 'Competitive team-based tactical shooter.', 44.99, 2, '2025-07-04', NULL),
('Deep Space Miner', 'Mine asteroids, upgrade your rig, and uncover alien artifacts.', 24.99, 2, '2025-03-10', NULL),
('Pixel Knights', 'Retro-style action RPG with pixel art graphics.', 9.99, 2, '2024-11-28', NULL);

-- Genres
INSERT INTO Genres (genre_name)
VALUES
('Action'),
('Roguelike'),
('Dungeon'),
('Horror'),
('Adventure'),
('Strategy'),
('Sports'),
('Racing'),
('Puzzle'),
('Simulation'),
('Multiplayer'),
('RPG');

-- GameGenres
INSERT INTO GameGenres (game_id, genre_id)
VALUES
-- Hollow Knight: Action (1), Roguelike (2)
(1, 1),
(1, 2),
-- Dungeon Escape: Roguelike (2), Dungeon (3)
(2, 2),
(2, 3),
-- Stellar Drift: Adventure (5), Strategy (6)
(3, 5),
(3, 6),
-- Nights of Terror: Horror (4), Action (1)
(4, 4),
(4, 1),
-- Farmers Valley: Simulation (10), RPG (12)
(5, 10),
(5, 12),
-- Neon Drift: Racing (8), Action (1)
(6, 8),
(6, 1),
-- Ancient Mysteries: Puzzle (9), Adventure (5)
(7, 9),
(7, 5),
-- Warzone Champions: Action (1), Multiplayer (11)
(8, 1),
(8, 11),
-- Deep Space Miner: Simulation (10), Strategy (6)
(9, 10),
(9, 6),
-- Pixel Knights: RPG (12), Action (1)
(10, 12),
(10, 1);

-- Wishlists
INSERT INTO Wishlists (user_id, game_id)
VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 6),
(4, 1),
(5, 8);

-- Purchases
INSERT INTO Purchases (user_id, total_price, payment_method)
VALUES
(1, 34.98, 'CARD'),
(3, 29.99, 'WALLET'),
(4, 14.99, 'CARD');

-- PurchaseItems
INSERT INTO PurchaseItems (purchase_id, game_id, price_at_purchase)
VALUES
(1, 1, 19.99),
(1, 2, 14.99),
(2, 3, 29.99),
(3, 7, 14.99);

-- Library
INSERT INTO Library (user_id, game_id, purchase_id, purchase_date, hours_played)
VALUES
(1, 1, 1, '2025-06-10', 25),
(1, 2, 1, '2025-06-10', 10),
(1, 3, NULL, '2025-08-30', 15),
(1, 4, NULL, '2025-11-05', 8),
(1, 5, NULL, '2025-01-15', 42),
(1, 6, NULL, '2026-03-01', 3),
(3, 3, 2, '2025-09-01', 22),
(4, 7, 3, '2025-05-20', 67);

-- Reviews
INSERT INTO Reviews (user_id, game_id, rating, comment)
VALUES
(1, 1, 5, 'Great great game, I played it like 10 hours'),
(1, 2, 1, 'Absolute dog shit who is making this game'),
(1, 3, 4, 'Really immersive, the procedural generation keeps it fresh'),
(3, 3, 5, 'Best space game I have ever played'),
(1, 4, 3, 'Decent horror, but too many jump scares'),
(4, 7, 5, 'The puzzles are incredibly clever, loved every minute'),
(4, 1, 4, 'Challenging but rewarding combat system'),
(5, 8, 3, 'Decent shooter but matchmaking needs work');

-- Favorites
INSERT INTO Favorites (user_id, game_id)
VALUES
(1, 1),
(1, 3),
(4, 7);

-- Gifts
INSERT INTO Gifts
(sender_user_id, recipient_user_id, game_id, gift_message, status)
VALUES
(1, 2, 1, 'Enjoy this wonderful experience dear friendooo!', 'ACCEPTED');
