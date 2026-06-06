CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    password VARCHAR(255),
    bio TEXT,
    role VARCHAR(20)
);

CREATE TABLE Games (
    game_id SERIAL PRIMARY KEY,
    name varchar(100),
    description TEXT,
    price DECIMAL(10, 2),
    developer_profile_id INT,
    release_date DATE
);

CREATE TABLE Wishlists (
    wishlist_id SERIAL PRIMARY KEY,
    user_id INT,
    game_id INT,
);

CREATE TABLE Genres (
    genre_id SERIAL PRIMARY KEY,
    genre_name varchar(50),
)

CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INT,
    game_id INT,
    rating INT,
    comment TEXT,
    hours_spent INT,
    review_date DATE
)

CREATE TABLE Library (
    library_id SERIAL PRIMARY KEY,
    user_id INT,
    game_id INT,
    purchase_date DATE,
    hours_played INT
)

CREATE TABLE GameGenres (
    game_id INT,
    genre_id INT,
    PRIMARY KEY (game_id, genre_id)
);

CREATE TABLE Purchases (
    purchase_id SERIAL PRIMARY KEY,
    user_id INT,
    total_price DECIMAL(10, 2),
    purchase_date DATE,
    payment_method VARCHAR(50)
);

CREATE TABLE PurchaseItems (
    purchase_item_id SERIAL PRIMARY KEY,
    purchase_id INT,
    game_id INT,
    price_at_purchase DECIMAL(10, 2)
);

CREATE TABLE Favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INT,
    game_id INT
);

CREATE TABLE Gifts (
    gift_id SERIAL PRIMARY KEY,
    sender_user_id INT,
    recipient_user_id INT,
    game_id INT,
    gift_date DATE
    gift_message TEXT,
    status VARCHAR(20)
);

CREATE TABLE DeveloperProfiles (
    developer_profile_id SERIAL PRIMARY KEY,
    user_id INT,
    studio_name VARCHAR(100)
);