CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',

    CHECK (role IN ('USER', 'ADMIN', 'DEVELOPER'))
);

CREATE TABLE DeveloperProfiles (
    user_id INT PRIMARY KEY,
    studio_name VARCHAR(100) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE Games (
    game_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    developer_user_id INT,
    release_date DATE,

    CHECK (price >= 0),

    FOREIGN KEY (developer_user_id) REFERENCES DeveloperProfiles(user_id)
        ON DELETE SET NULL
);

CREATE TABLE Genres (
    genre_id SERIAL PRIMARY KEY,
    genre_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE GameGenres (
    game_id INT NOT NULL,
    genre_id INT NOT NULL,

    PRIMARY KEY (game_id, genre_id),

    FOREIGN KEY (game_id) REFERENCES Games(game_id)
        ON DELETE CASCADE,

    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id)
        ON DELETE CASCADE
);

CREATE TABLE Wishlists (
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    added_at DATE DEFAULT CURRENT_DATE,

    PRIMARY KEY (user_id, game_id),

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (game_id) REFERENCES Games(game_id)
        ON DELETE CASCADE
);

CREATE TABLE Purchases (
    purchase_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    purchase_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL,

    CHECK (total_price >= 0),
    CHECK (payment_method IN ('CARD', 'WALLET', 'FAKE_PAYMENT', 'GIFT')),

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE PurchaseItems (
    purchase_id INT NOT NULL,
    game_id INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (purchase_id, game_id),

    CHECK (price_at_purchase >= 0),

    FOREIGN KEY (purchase_id) REFERENCES Purchases(purchase_id)
        ON DELETE CASCADE,

    FOREIGN KEY (game_id) REFERENCES Games(game_id)
        ON DELETE RESTRICT
);

CREATE TABLE Library (
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    purchase_id INT,
    purchase_date DATE DEFAULT CURRENT_DATE,
    hours_played INT DEFAULT 0,

    PRIMARY KEY (user_id, game_id),

    CHECK (hours_played >= 0),

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (game_id) REFERENCES Games(game_id)
        ON DELETE RESTRICT,

    FOREIGN KEY (purchase_id) REFERENCES Purchases(purchase_id)
        ON DELETE SET NULL
);

CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    review_date DATE DEFAULT CURRENT_DATE,

    UNIQUE (user_id, game_id),

    CHECK (rating BETWEEN 1 AND 5),

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (game_id) REFERENCES Games(game_id)
        ON DELETE CASCADE
);

CREATE TABLE Favorites (
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    added_at DATE DEFAULT CURRENT_DATE,

    PRIMARY KEY (user_id, game_id),

    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (game_id) REFERENCES Games(game_id)
        ON DELETE CASCADE
);

CREATE TABLE Gifts (
    gift_id SERIAL PRIMARY KEY,
    sender_user_id INT NOT NULL,
    recipient_user_id INT NOT NULL,
    game_id INT NOT NULL,
    gift_date DATE DEFAULT CURRENT_DATE,
    gift_message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
    CHECK (sender_user_id <> recipient_user_id),

    FOREIGN KEY (sender_user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (recipient_user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (game_id) REFERENCES Games(game_id)
        ON DELETE RESTRICT
);
