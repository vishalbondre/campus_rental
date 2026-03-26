-- ============================================================
--  CampusRent  |  MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS campus_rental;
USE campus_rental;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE Users (
    user_id        BIGINT        NOT NULL AUTO_INCREMENT,
    email_id       VARCHAR(255)  NOT NULL UNIQUE,           -- campus email required
    password_hash  VARCHAR(255)  NOT NULL,
    full_name      VARCHAR(100)  NOT NULL,
    phone_number   VARCHAR(20),
    campus_name    VARCHAR(150)  NOT NULL,
    profile_image  VARCHAR(512),
    role           ENUM('STUDENT','ADMIN') NOT NULL DEFAULT 'STUDENT',
    is_verified    BOOLEAN       NOT NULL DEFAULT FALSE,
    rating_avg     DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
    rating_count   INT           NOT NULL DEFAULT 0,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    INDEX idx_users_email (email_id),
    INDEX idx_users_campus (campus_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Categories ───────────────────────────────────────────────
CREATE TABLE Categories (
    category_id   BIGINT        NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100)  NOT NULL UNIQUE,
    description   TEXT,
    icon          VARCHAR(100),                             -- icon slug / emoji key
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed categories
INSERT INTO Categories (name, description, icon) VALUES
('Electronics',  'Laptops, cameras, calculators, tablets',    'cpu'),
('Bicycles',     'Mountain, road, and campus cruiser bikes',   'bike'),
('Costumes',     'Halloween, theatre, and themed costumes',    'mask'),
('Textbooks',    'Course textbooks and study materials',       'book'),
('Sports Gear',  'Sports equipment and outdoor gear',         'activity'),
('Tools',        'Power tools, hand tools, and accessories',  'wrench'),
('Furniture',    'Desks, chairs, lamps, and small furniture', 'sofa'),
('Photography',  'Cameras, lenses, tripods, and lighting',    'camera');

-- ── Items ────────────────────────────────────────────────────
CREATE TABLE Items (
    item_id           BIGINT          NOT NULL AUTO_INCREMENT,
    owner_id          BIGINT          NOT NULL,
    category_id       BIGINT          NOT NULL,
    title             VARCHAR(200)    NOT NULL,
    description       TEXT            NOT NULL,
    daily_price       DECIMAL(10,2)   NOT NULL,
    security_deposit  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    condition_rating  ENUM('POOR','FAIR','GOOD','EXCELLENT') NOT NULL DEFAULT 'GOOD',
    latitude          DECIMAL(10,8)   NOT NULL,
    longitude         DECIMAL(11,8)   NOT NULL,
    location_label    VARCHAR(255),                        -- e.g. "Engineering Building"
    campus_name       VARCHAR(150)    NOT NULL,
    status            ENUM('AVAILABLE','RENTED','PAUSED','REMOVED') NOT NULL DEFAULT 'AVAILABLE',
    image_urls        JSON,                                -- array of image URLs
    tags              JSON,                                -- searchable tags array
    view_count        INT             NOT NULL DEFAULT 0,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (item_id),
    FOREIGN KEY (owner_id)    REFERENCES Users(user_id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE RESTRICT,
    INDEX idx_items_owner    (owner_id),
    INDEX idx_items_category (category_id),
    INDEX idx_items_status   (status),
    INDEX idx_items_campus   (campus_name),
    FULLTEXT INDEX ft_items_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Rental_Transactions ──────────────────────────────────────
CREATE TABLE Rental_Transactions (
    transaction_id     BIGINT        NOT NULL AUTO_INCREMENT,
    item_id            BIGINT        NOT NULL,
    borrower_id        BIGINT        NOT NULL,
    owner_id           BIGINT        NOT NULL,
    start_date         DATE          NOT NULL,
    end_date           DATE          NOT NULL,
    daily_price        DECIMAL(10,2) NOT NULL,
    total_amount       DECIMAL(10,2) NOT NULL,
    security_deposit   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    deposit_returned   BOOLEAN       NOT NULL DEFAULT FALSE,
    status             ENUM('PENDING','APPROVED','ACTIVE','COMPLETED','CANCELLED','DISPUTED')
                                      NOT NULL DEFAULT 'PENDING',
    pickup_location    VARCHAR(255),
    return_location    VARCHAR(255),
    borrower_notes     TEXT,
    owner_notes        TEXT,
    dispute_reason     TEXT,
    dispute_resolved   BOOLEAN       NOT NULL DEFAULT FALSE,
    dispute_resolved_by BIGINT,
    created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (transaction_id),
    FOREIGN KEY (item_id)    REFERENCES Items(item_id)   ON DELETE RESTRICT,
    FOREIGN KEY (borrower_id) REFERENCES Users(user_id)  ON DELETE RESTRICT,
    FOREIGN KEY (owner_id)    REFERENCES Users(user_id)  ON DELETE RESTRICT,
    FOREIGN KEY (dispute_resolved_by) REFERENCES Users(user_id) ON DELETE SET NULL,
    INDEX idx_rt_item      (item_id),
    INDEX idx_rt_borrower  (borrower_id),
    INDEX idx_rt_owner     (owner_id),
    INDEX idx_rt_status    (status),
    INDEX idx_rt_dates     (start_date, end_date),
    -- Prevent double-booking
    CONSTRAINT chk_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Reviews ──────────────────────────────────────────────────
CREATE TABLE Reviews (
    review_id       BIGINT  NOT NULL AUTO_INCREMENT,
    transaction_id  BIGINT  NOT NULL,
    reviewer_id     BIGINT  NOT NULL,
    reviewee_id     BIGINT  NOT NULL,
    item_id         BIGINT  NOT NULL,
    rating          TINYINT NOT NULL,                   -- 1-5
    comment         TEXT,
    review_type     ENUM('OWNER_TO_BORROWER','BORROWER_TO_OWNER') NOT NULL,
    is_flagged      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id),
    FOREIGN KEY (transaction_id) REFERENCES Rental_Transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id)    REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id)    REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id)        REFERENCES Items(item_id) ON DELETE CASCADE,
    UNIQUE KEY uq_review_per_tx_type (transaction_id, reviewer_id, review_type),
    INDEX idx_reviews_reviewee (reviewee_id),
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Trigger: update user rating on new review ────────────────
DELIMITER $$
CREATE TRIGGER trg_update_user_rating
AFTER INSERT ON Reviews
FOR EACH ROW
BEGIN
    UPDATE Users
    SET rating_avg   = (SELECT AVG(rating) FROM Reviews WHERE reviewee_id = NEW.reviewee_id),
        rating_count = (SELECT COUNT(*)    FROM Reviews WHERE reviewee_id = NEW.reviewee_id)
    WHERE user_id = NEW.reviewee_id;
END$$
DELIMITER ;
