CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('author','reader') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE articles (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status ENUM('Draft','Published') DEFAULT 'Draft',
    author_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE read_logs (
    id VARCHAR(36) PRIMARY KEY,
    article_id VARCHAR(36),
    reader_id VARCHAR(36) NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (reader_id) REFERENCES users(id)
);

CREATE TABLE daily_analytics (
    id VARCHAR(36) PRIMARY KEY,
    article_id VARCHAR(36),
    view_count INT DEFAULT 0,
    date DATE,
    UNIQUE(article_id, date),
    FOREIGN KEY (article_id) REFERENCES articles(id)
);