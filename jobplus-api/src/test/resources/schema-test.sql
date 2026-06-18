-- H2-compatible schema for integration tests.
-- Uses VARCHAR instead of ENUM; omits ON UPDATE (not supported in H2).

CREATE TABLE IF NOT EXISTS `user` (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL,
    name          VARCHAR(100),
    headline      VARCHAR(220),
    avatar_url    VARCHAR(500),
    location      VARCHAR(100),
    status        VARCHAR(20) DEFAULT 'ACTIVE',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
