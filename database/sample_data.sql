-- Repeatable demo seed data for GameHub.
-- Load after schema.sql. This reset keeps IDs stable for demos and test queries.
TRUNCATE TABLE
    Friends,
    Gifts,
    Favorites,
    Reviews,
    Library,
    CartItems,
    Carts,
    PurchaseItems,
    Purchases,
    Wishlists,
    GameGenres,
    Games,
    Genres,
    DeveloperProfiles,
    Users
RESTART IDENTITY CASCADE;

-- Password notes for original demo accounts:
-- Taha: sigma67_lover, Emren: womenfearme, Joel: frontendfull,
-- Berk: helloguys, Omer: ilvposgre, Ali: JaxLover.
-- Additional demo users reuse the same bcrypt hash as Taha for simple local testing.
INSERT INTO Users (username, email, password_hash, bio, profile_image_url, role)
VALUES
('Taha', 'taha@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Indie action fan who tracks every boss fight.', 'Taha.jpg', 'USER'),
('Emren', 'emren@test.com', '$2b$10$RibqaKDCgQCDjVpV6ENhiOpnPKaA4RQHC25YYxEbvMEJJVQ6n7hE2', 'Developer focused on retro RPG and arcade systems.', 'Emren.jpg', 'DEVELOPER'),
('Joel', 'joel@test.com', '$2b$10$gg/Mp1uOJDkx0xQ8hLWxGO.9H9KgFAlSNxuZFZKc3KywOXLDy/vZW', 'Platform admin and curator.', 'Joel.jpg', 'ADMIN'),
('Berk', 'berk@test.com', '$2b$10$uTZnrLoAeW1yjAbzhSQojenownIlwGMty3ym/Par.3KFSzsKfhxOe', 'Puzzle collector and completionist.', 'Berk.jpg', 'USER'),
('Omer', 'omer@test.com', '$2b$10$I5eO6wK/ZusRN13Y7C59w.65zfVaCBxo5g/URRP8tAqs90jdNiaIq', 'Competitive shooter and strategy player.', 'Omer.jpg', 'USER'),
('Ali', 'ali@test.com', '$2b$10$UIX7vHv.kF4cOjyFlnYpB.fGWeYMvYVBHM5yptoS0otNgA2DxAyNq', 'Cozy game enjoyer with a long backlog.', 'Ali.jpg', 'USER'),
('Mira', 'mira@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Horror designer building tense systems.', 'Mira.jpg', 'DEVELOPER'),
('Deniz', 'deniz@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Space, racing, and simulation developer.', 'Deniz.jpg', 'DEVELOPER'),
('Lara', 'lara@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Cozy systems and puzzle game developer.', 'Lara.jpg', 'DEVELOPER'),
('Selin', 'selin@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Operations admin watching sales and reviews.', 'Selin.jpg', 'ADMIN'),
('Elif', 'elif@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Space exploration and management fan.', 'Elif.jpg', 'USER'),
('Can', 'can@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Horror streamer and review writer.', 'Can.jpg', 'USER'),
('Aylin', 'aylin@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Simulation player who loves long sessions.', 'Aylin.jpg', 'USER'),
('Kerem', 'kerem@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'RPG player and lore note taker.', 'Kerem.jpg', 'USER'),
('Zeynep', 'zeynep@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Sports and racing game regular.', 'Zeynep.jpg', 'USER'),
('Mert', 'mert@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Tactical multiplayer player.', 'Mert.jpg', 'USER'),
('Ece', 'ece@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Action RPG and achievement hunter.', 'Ece.jpg', 'USER'),
('Kaan', 'kaan@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Racing fan who tests every new track.', 'Kaan.jpg', 'USER'),
('Asli', 'asli@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Puzzle and mystery player.', 'Asli.jpg', 'USER'),
('Burak', 'burak@test.com', '$2b$10$kiOCKORGwJIy0tqtvlOHvua2uQQ2sPXQdULxVVX8Epi5RC.tC1doy', 'Enjoys difficult platformers and co-op games.', 'Burak.jpg', 'USER');

INSERT INTO DeveloperProfiles (user_id, studio_name)
VALUES
(2, 'Pixel Forge'),
(7, 'Night Lantern Games'),
(8, 'Blue Orbit Interactive'),
(9, 'Quiet Lake Studio');

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
('RPG'),
('Stealth'),
('Mystery'),
('Casual');

INSERT INTO Games (name, description, price, developer_user_id, release_date, cover_image_url)
VALUES
('Hollow Knight', 'Atmospheric action adventure with tight combat and hidden paths.', 19.99, 2, '2024-06-07', 'knight.jpg'),
('Dungeon Escape', 'Roguelike dungeon crawler with procedural rooms and relic builds.', 24.00, 2, '2024-09-16', 'dungeonescape.jpg'),
('Stellar Drift', 'Explore a procedurally generated universe with your own starship.', 29.99, 8, '2025-08-22', 'stellar-drift.jpg'),
('Nights of Terror', 'Survival horror set in an abandoned research facility.', 34.99, 7, '2025-10-31', 'nights-of-terror.jpg'),
('Farmers Valley', 'Cozy farming simulator with crafting and seasonal events.', 19.99, 9, '2024-09-12', 'farmers-valley.jpg'),
('Neon Drift', 'High-speed futuristic zero-G racing.', 0.00, 8, '2026-02-20', 'neon-drift.jpg'),
('Ancient Mysteries', 'First-person puzzle adventure exploring forgotten temples.', 14.99, 9, '2025-05-15', 'ancient-mysteries.jpg'),
('Warzone Champions', 'Competitive team-based tactical shooter.', 44.99, 7, '2025-07-04', 'warzone-champions.jpg'),
('Deep Space Miner', 'Mine asteroids, upgrade your rig, and uncover alien artifacts.', 24.99, 8, '2025-03-10', 'deep-space-miner.jpg'),
('Pixel Knights', 'Retro-style action RPG with pixel art graphics.', 9.99, 2, '2024-11-28', 'pixel-knights.jpg'),
('City Planner', 'Design transport networks and manage a growing modern city.', 27.99, 9, '2025-01-18', 'city-planner.jpg'),
('Shadow Circuit', 'Stealth action game about infiltrating neon corporate towers.', 22.99, 7, '2025-04-04', 'shadow-circuit.jpg'),
('Ocean Colony', 'Build an underwater base and keep your colonists alive.', 17.99, 9, '2025-02-14', 'ocean-colony.jpg'),
('Sky Arena', 'Fast multiplayer arena sports with aerial trick shots.', 12.99, 8, '2024-12-05', 'sky-arena.jpg'),
('Clockwork Manor', 'Mystery puzzle game full of secret rooms and mechanical locks.', 16.99, 9, '2025-09-09', 'clockwork-manor.jpg'),
('Frost Realm', 'Open-world fantasy RPG across frozen kingdoms.', 39.99, 2, '2025-11-21', 'frost-realm.jpg'),
('Turbo Rally', 'Arcade rally racing with dynamic weather and split-screen play.', 21.99, 8, '2024-08-30', 'turbo-rally.jpg'),
('Castle Siege Tactics', 'Turn-based strategy battles with destructible walls.', 31.99, 7, '2025-06-01', 'castle-siege.jpg'),
('Solar Garden', 'Relaxing solar-powered gardening game across tiny planets.', 11.99, 9, '2025-03-22', 'solar-garden.jpg'),
('Rift Raiders', 'Co-op action RPG with portals, loot, and raid bosses.', 26.99, 2, '2026-01-12', 'rift-raiders.jpg'),
('Cyber Courier', 'Deliver packages across a vertical cyberpunk city.', 18.99, 8, '2025-07-19', 'cyber-courier.jpg'),
('Haunted Harbor', 'Investigate a foggy harbor where ships return empty.', 23.99, 7, '2025-10-13', 'haunted-harbor.jpg'),
('Logic Forge', 'Minimalist logic puzzle game with programmable machines.', 8.99, 9, '2024-07-25', 'logic-forge.jpg'),
('Battle Bots Online', 'Free-to-play robot arena battles with ranked matchmaking.', 0.00, 7, '2025-12-02', 'battle-bots.jpg'),
('Star Chef', 'Run an intergalactic restaurant with odd alien customers.', 13.99, 9, '2025-04-27', 'star-chef.jpg'),
('Mythic Isles', 'Story-rich island adventure with mythological companions.', 32.99, 2, '2025-08-08', 'mythic-isles.jpg'),
('Red Planet Rescue', 'Strategy survival mission on a failing Mars colony.', 28.99, 8, '2026-03-18', 'red-planet-rescue.jpg'),
('Arena Tennis Pro', 'Competitive tennis with online leagues and career mode.', 29.99, 7, '2024-06-22', 'arena-tennis.jpg'),
('Echoes of Atlantis', 'Narrative mystery adventure in a submerged ancient city.', 25.99, 9, '2025-05-30', 'echoes-atlantis.jpg'),
('Mini Metroverse', 'Compact transit puzzle game about moving tiny commuters.', 7.99, 9, '2024-10-10', 'mini-metroverse.jpg'),
('Void Rangers', 'Squad-based space action campaign with tactical missions.', 36.99, 8, '2025-09-26', 'void-rangers.jpg'),
('Potion Academy', 'Study magic, brew potions, and manage student life.', 15.99, 2, '2025-02-07', 'potion-academy.jpg');

INSERT INTO GameGenres (game_id, genre_id)
VALUES
(1, 1), (1, 2),
(2, 2), (2, 3),
(3, 5), (3, 6),
(4, 4), (4, 1),
(5, 10), (5, 12),
(6, 8), (6, 1),
(7, 9), (7, 5),
(8, 1), (8, 11),
(9, 10), (9, 6),
(10, 12), (10, 1),
(11, 10), (11, 6),
(12, 13), (12, 1),
(13, 10), (13, 6),
(14, 7), (14, 11),
(15, 9), (15, 14),
(16, 12), (16, 5),
(17, 8), (17, 7),
(18, 6), (18, 11),
(19, 15), (19, 10),
(20, 1), (20, 12),
(21, 8), (21, 5),
(22, 4), (22, 14),
(23, 9), (23, 15),
(24, 11), (24, 1),
(25, 10), (25, 15),
(26, 5), (26, 12),
(27, 6), (27, 5),
(28, 7), (28, 11),
(29, 14), (29, 5),
(30, 9), (30, 6),
(31, 1), (31, 5),
(32, 10), (32, 12);

INSERT INTO Purchases (user_id, total_price, purchase_date, payment_method)
VALUES
(1, 43.99, '2025-01-04', 'CARD'),
(1, 9.99, '2025-02-11', 'WALLET'),
(4, 31.98, '2025-02-15', 'CARD'),
(5, 44.99, '2025-03-02', 'CARD'),
(6, 31.98, '2025-03-18', 'WALLET'),
(11, 54.98, '2025-04-09', 'CARD'),
(12, 58.98, '2025-04-21', 'CARD'),
(13, 59.97, '2025-05-03', 'CARD'),
(14, 72.98, '2025-05-16', 'WALLET'),
(15, 51.98, '2025-06-01', 'CARD'),
(16, 31.99, '2025-06-17', 'CARD'),
(17, 63.98, '2025-07-07', 'WALLET'),
(18, 47.98, '2025-07-22', 'CARD'),
(19, 16.98, '2025-08-14', 'CARD'),
(20, 38.98, '2025-08-29', 'WALLET'),
(3, 106.97, '2025-09-03', 'CARD'),
(10, 47.98, '2025-09-18', 'CARD'),
(4, 19.99, '2025-10-05', 'FAKE_PAYMENT'),
(11, 34.98, '2025-10-19', 'CARD'),
(15, 40.98, '2025-11-06', 'CARD');

INSERT INTO PurchaseItems (purchase_id, game_id, price_at_purchase)
VALUES
(1, 1, 19.99), (1, 2, 24.00),
(2, 6, 0.00), (2, 10, 9.99),
(3, 7, 14.99), (3, 15, 16.99),
(4, 8, 44.99),
(5, 5, 19.99), (5, 19, 11.99),
(6, 3, 29.99), (6, 9, 24.99),
(7, 4, 34.99), (7, 22, 23.99),
(8, 11, 27.99), (8, 13, 17.99), (8, 25, 13.99),
(9, 16, 39.99), (9, 26, 32.99),
(10, 17, 21.99), (10, 28, 29.99),
(11, 18, 31.99), (11, 24, 0.00),
(12, 20, 26.99), (12, 31, 36.99),
(13, 21, 18.99), (13, 27, 28.99),
(14, 23, 8.99), (14, 30, 7.99),
(15, 32, 15.99), (15, 12, 22.99),
(16, 3, 29.99), (16, 8, 44.99), (16, 18, 31.99),
(17, 5, 19.99), (17, 11, 27.99),
(18, 1, 19.99), (18, 6, 0.00),
(19, 14, 12.99), (19, 17, 21.99),
(20, 29, 25.99), (20, 7, 14.99);

INSERT INTO Library (user_id, game_id, purchase_id, purchase_date, hours_played)
SELECT
    p.user_id,
    pi.game_id,
    p.purchase_id,
    p.purchase_date,
    ((p.user_id * 7 + pi.game_id * 3) % 120) + 1 AS hours_played
FROM PurchaseItems pi
JOIN Purchases p ON p.purchase_id = pi.purchase_id;

INSERT INTO Reviews (user_id, game_id, rating, comment, review_date)
VALUES
(1, 1, 5, 'Tight combat and exploration. Great demo game for the store.', '2025-01-10'),
(1, 2, 4, 'Good dungeon variety and strong replay value.', '2025-01-12'),
(1, 10, 5, 'Short, sharp, and very charming.', '2025-02-15'),
(4, 7, 5, 'The temple puzzles are clever without feeling unfair.', '2025-02-20'),
(4, 15, 4, 'Beautiful mystery atmosphere and satisfying locks.', '2025-02-22'),
(4, 1, 4, 'Hard, but the boss fights feel rewarding.', '2025-10-08'),
(5, 8, 3, 'Fun tactical shooter, matchmaking could be better.', '2025-03-05'),
(6, 5, 5, 'Relaxing and surprisingly deep farming loop.', '2025-03-23'),
(6, 19, 4, 'Very cozy planet gardening game.', '2025-03-25'),
(11, 3, 5, 'Space travel feels huge and meaningful.', '2025-04-12'),
(11, 9, 4, 'Mining upgrades are satisfying.', '2025-04-15'),
(12, 4, 4, 'Strong horror pacing and excellent sound design.', '2025-04-24'),
(12, 22, 5, 'The harbor mystery kept me playing late.', '2025-04-26'),
(13, 11, 4, 'Great city planning challenge for strategy players.', '2025-05-07'),
(13, 25, 5, 'Funny alien restaurant scenarios.', '2025-05-08'),
(14, 16, 5, 'Large RPG with memorable quests.', '2025-05-20'),
(15, 17, 4, 'Fast racing and solid weather effects.', '2025-06-04'),
(15, 28, 3, 'Good career mode, online can be uneven.', '2025-06-05'),
(16, 18, 4, 'Good tactical choices and readable battles.', '2025-06-20'),
(17, 20, 5, 'Loot and co-op fights are excellent.', '2025-07-12'),
(17, 31, 4, 'Strong mission design and stylish action.', '2025-07-13'),
(18, 21, 4, 'Cyber city traversal is very fun.', '2025-07-25'),
(19, 23, 5, 'Clean logic puzzles and great difficulty curve.', '2025-08-18'),
(20, 32, 4, 'Cute academy sim with good progression.', '2025-09-01'),
(3, 8, 4, 'Popular competitive title with strong retention.', '2025-09-06'),
(10, 11, 4, 'Useful benchmark for simulation queries.', '2025-09-20'),
(11, 14, 3, 'Fun with friends, less exciting solo.', '2025-10-22'),
(15, 29, 5, 'Excellent mystery writing and pacing.', '2025-11-09'),
(20, 12, 4, 'Stylish stealth game with a few difficulty spikes.', '2025-09-03');

INSERT INTO Wishlists (user_id, game_id, added_at)
VALUES
(1, 3, '2025-01-20'), (1, 16, '2025-02-18'), (1, 20, '2025-03-12'), (1, 31, '2025-04-11'),
(4, 3, '2025-02-25'), (4, 8, '2025-03-01'), (4, 18, '2025-03-06'), (4, 29, '2025-03-09'),
(5, 4, '2025-03-12'), (5, 12, '2025-03-13'), (5, 22, '2025-03-14'), (5, 24, '2025-03-15'),
(6, 11, '2025-03-20'), (6, 13, '2025-03-21'), (6, 25, '2025-03-22'), (6, 32, '2025-03-23'),
(11, 16, '2025-04-18'), (11, 26, '2025-04-19'), (11, 27, '2025-04-20'),
(12, 1, '2025-04-27'), (12, 15, '2025-04-28'), (12, 29, '2025-04-29'),
(13, 19, '2025-05-09'), (13, 30, '2025-05-10'), (13, 32, '2025-05-11'),
(14, 2, '2025-05-22'), (14, 20, '2025-05-23'), (14, 31, '2025-05-24'),
(15, 6, '2025-06-07'), (15, 21, '2025-06-08'), (15, 27, '2025-06-09'),
(16, 8, '2025-06-22'), (16, 14, '2025-06-23'), (16, 28, '2025-06-24'),
(17, 1, '2025-07-15'), (17, 10, '2025-07-16'), (17, 26, '2025-07-17'),
(18, 17, '2025-07-28'), (18, 31, '2025-07-29'),
(19, 7, '2025-08-20'), (19, 15, '2025-08-21'), (19, 29, '2025-08-22'),
(20, 5, '2025-09-04'), (20, 19, '2025-09-05'), (20, 25, '2025-09-06');

INSERT INTO Favorites (user_id, game_id, added_at)
VALUES
(1, 1, '2025-01-11'), (1, 10, '2025-02-16'), (1, 31, '2025-04-12'),
(4, 7, '2025-02-21'), (4, 15, '2025-02-23'), (4, 1, '2025-10-09'),
(5, 8, '2025-03-07'), (5, 24, '2025-03-16'),
(6, 5, '2025-03-24'), (6, 19, '2025-03-26'), (6, 25, '2025-03-27'),
(11, 3, '2025-04-13'), (11, 9, '2025-04-16'), (11, 14, '2025-10-23'),
(12, 4, '2025-04-25'), (12, 22, '2025-04-27'),
(13, 11, '2025-05-08'), (13, 25, '2025-05-09'),
(14, 16, '2025-05-21'), (14, 26, '2025-05-22'),
(15, 17, '2025-06-05'), (15, 29, '2025-11-10'),
(16, 18, '2025-06-21'), (16, 24, '2025-06-22'),
(17, 20, '2025-07-13'), (17, 31, '2025-07-14'),
(18, 21, '2025-07-26'), (18, 27, '2025-07-27'),
(19, 23, '2025-08-19'), (19, 30, '2025-08-20'),
(20, 32, '2025-09-02'), (20, 12, '2025-09-04'),
(3, 8, '2025-09-07'), (10, 11, '2025-09-21');

INSERT INTO Gifts (sender_user_id, recipient_user_id, game_id, gift_date, gift_message, status)
VALUES
(1, 4, 10, '2025-02-18', 'This one reminded me of your favorite retro games.', 'ACCEPTED'),
(4, 1, 23, '2025-03-02', 'Try this puzzle game when you have time.', 'PENDING'),
(5, 12, 24, '2025-03-18', 'Free arena game for your stream night.', 'ACCEPTED'),
(6, 13, 19, '2025-04-01', 'A cozy planet game for your collection.', 'REJECTED'),
(11, 18, 3, '2025-04-25', 'You will love the exploration.', 'PENDING'),
(12, 5, 22, '2025-05-02', 'This horror game is perfect for you.', 'CANCELLED'),
(13, 6, 25, '2025-05-12', 'Restaurant chaos but cute.', 'ACCEPTED'),
(14, 17, 26, '2025-05-30', 'Big RPG for the weekend.', 'PENDING'),
(15, 18, 17, '2025-06-12', 'Racing night soon?', 'ACCEPTED'),
(16, 5, 18, '2025-06-25', 'Strategy match practice.', 'REJECTED'),
(17, 20, 20, '2025-07-18', 'Co-op raid game for us.', 'PENDING'),
(18, 15, 21, '2025-08-01', 'Cyber courier routes are your style.', 'ACCEPTED');

INSERT INTO Library (user_id, game_id, purchase_id, purchase_date, hours_played)
SELECT
    recipient_user_id,
    game_id,
    NULL,
    gift_date,
    ((recipient_user_id * 5 + game_id * 2) % 80) + 1
FROM Gifts
WHERE status = 'ACCEPTED'
ON CONFLICT (user_id, game_id) DO NOTHING;

INSERT INTO Carts (user_id, created_at)
VALUES
(1, '2025-11-08 10:00:00'),
(4, '2025-11-08 10:05:00'),
(5, '2025-11-08 10:10:00'),
(11, '2025-11-08 10:15:00'),
(12, '2025-11-08 10:20:00'),
(13, '2025-11-08 10:25:00'),
(14, '2025-11-08 10:30:00'),
(15, '2025-11-08 10:35:00'),
(16, '2025-11-08 10:40:00'),
(17, '2025-11-08 10:45:00');

INSERT INTO CartItems (cart_id, game_id, added_at)
VALUES
(1, 29, '2025-11-08 10:01:00'), (1, 32, '2025-11-08 10:02:00'),
(2, 20, '2025-11-08 10:06:00'), (2, 31, '2025-11-08 10:07:00'),
(3, 6, '2025-11-08 10:11:00'), (3, 14, '2025-11-08 10:12:00'),
(4, 15, '2025-11-08 10:16:00'), (4, 23, '2025-11-08 10:17:00'),
(5, 11, '2025-11-08 10:21:00'), (5, 13, '2025-11-08 10:22:00'),
(6, 30, '2025-11-08 10:26:00'), (6, 32, '2025-11-08 10:27:00'),
(7, 18, '2025-11-08 10:31:00'), (7, 27, '2025-11-08 10:32:00'),
(8, 3, '2025-11-08 10:36:00'), (8, 22, '2025-11-08 10:37:00'),
(9, 1, '2025-11-08 10:41:00'), (9, 12, '2025-11-08 10:42:00'),
(10, 2, '2025-11-08 10:46:00'), (10, 28, '2025-11-08 10:47:00');

INSERT INTO Friends (user_id, friend_id, status, created_at)
VALUES
(1, 4, 'ACCEPTED', '2025-01-02 10:00:00'),
(1, 5, 'ACCEPTED', '2025-01-03 10:00:00'),
(1, 6, 'ACCEPTED', '2025-01-04 10:00:00'),
(4, 11, 'ACCEPTED', '2025-02-12 11:00:00'),
(4, 12, 'ACCEPTED', '2025-02-13 11:00:00'),
(5, 16, 'ACCEPTED', '2025-03-03 12:00:00'),
(6, 13, 'ACCEPTED', '2025-03-19 12:00:00'),
(11, 18, 'ACCEPTED', '2025-04-10 13:00:00'),
(12, 5, 'ACCEPTED', '2025-04-22 13:00:00'),
(13, 6, 'ACCEPTED', '2025-05-04 14:00:00'),
(14, 17, 'ACCEPTED', '2025-05-17 14:00:00'),
(15, 18, 'ACCEPTED', '2025-06-02 15:00:00'),
(16, 5, 'PENDING', '2025-06-18 15:00:00'),
(17, 20, 'PENDING', '2025-07-08 16:00:00'),
(18, 15, 'PENDING', '2025-07-23 16:00:00'),
(19, 4, 'PENDING', '2025-08-15 17:00:00'),
(20, 1, 'PENDING', '2025-08-30 17:00:00'),
(11, 14, 'ACCEPTED', '2025-09-10 18:00:00'),
(12, 19, 'ACCEPTED', '2025-09-12 18:00:00'),
(13, 20, 'ACCEPTED', '2025-09-14 18:00:00'),
(3, 10, 'ACCEPTED', '2025-09-18 19:00:00'),
(2, 7, 'ACCEPTED', '2025-09-19 19:00:00'),
(8, 9, 'ACCEPTED', '2025-09-20 19:00:00'),
(5, 11, 'BLOCKED', '2025-10-01 20:00:00');
