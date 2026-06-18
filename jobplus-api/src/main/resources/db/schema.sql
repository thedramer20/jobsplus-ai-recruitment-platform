CREATE DATABASE IF NOT EXISTS jobplus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jobplus;

-- ======================================================
-- PART 1: Users and Profiles
-- ======================================================

CREATE TABLE IF NOT EXISTS `user` (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('JOB_SEEKER', 'EMPLOYER', 'ADMIN') NOT NULL,
    name          VARCHAR(100),
    headline      VARCHAR(220),
    avatar_url    VARCHAR(500),
    location      VARCHAR(100),
    status        ENUM('ACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
    user_id       BIGINT PRIMARY KEY,
    settings_json TEXT,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_token (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT NOT NULL,
    token_hash  CHAR(64) NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    used        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE
);

CREATE INDEX idx_prt_token_hash ON password_reset_token(token_hash);

CREATE TABLE IF NOT EXISTS seeker_profile (
    user_id            BIGINT PRIMARY KEY,
    bio                TEXT,
    years_experience   INT,
    education_summary  VARCHAR(500),
    resume_url         VARCHAR(500),
    open_to_work       BOOLEAN DEFAULT FALSE,
    banner_gradient    VARCHAR(100),
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_seeker_profile_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experience (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id      BIGINT NOT NULL,
    title        VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    location     VARCHAR(100),
    start_date   DATE,
    end_date     DATE NULL,
    current      BOOLEAN DEFAULT FALSE,
    description  TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_experience_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS education (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id        BIGINT NOT NULL,
    school         VARCHAR(150),
    degree         VARCHAR(100),
    field_of_study VARCHAR(100),
    start_year     INT,
    end_year       INT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_education_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skill (
    id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_skill (
    user_id  BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, skill_id),
    CONSTRAINT fk_user_skill_user  FOREIGN KEY (user_id)  REFERENCES `user`(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_skill_skill FOREIGN KEY (skill_id) REFERENCES skill(id)  ON DELETE CASCADE
);

CREATE INDEX idx_user_email    ON `user`(email);
CREATE INDEX idx_user_role     ON `user`(role);
CREATE INDEX idx_user_status   ON `user`(status);
CREATE INDEX idx_exp_user_id   ON experience(user_id);
CREATE INDEX idx_edu_user_id   ON education(user_id);

-- ======================================================
-- PART 2: Companies and Jobs
-- ======================================================

CREATE TABLE IF NOT EXISTS company (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(150) NOT NULL,
    logo_url    VARCHAR(500),
    industry    VARCHAR(100),
    size        ENUM('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'),
    location    VARCHAR(100),
    website     VARCHAR(255),
    description TEXT,
    verified    BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_member (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    position   VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_company_member (company_id, user_id),
    CONSTRAINT fk_company_member_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE,
    CONSTRAINT fk_company_member_user    FOREIGN KEY (user_id)    REFERENCES `user`(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id       BIGINT NOT NULL,
    posted_by        BIGINT NOT NULL,
    title            VARCHAR(150) NOT NULL,
    description      TEXT NOT NULL,
    location         VARCHAR(100),
    employment_type  ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE') NOT NULL,
    experience_level ENUM('ENTRY', 'MID', 'SENIOR', 'LEAD', 'MANAGER') NOT NULL,
    salary_min       DECIMAL(10, 2) NULL,
    salary_max       DECIMAL(10, 2) NULL,
    status           ENUM('OPEN', 'CLOSED', 'REMOVED') DEFAULT 'OPEN',
    posted_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline         DATE NULL,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_company   FOREIGN KEY (company_id) REFERENCES company(id)  ON DELETE CASCADE,
    CONSTRAINT fk_job_posted_by FOREIGN KEY (posted_by)  REFERENCES `user`(id)
);

CREATE TABLE IF NOT EXISTS job_skill (
    job_id   BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    CONSTRAINT fk_job_skill_job   FOREIGN KEY (job_id)   REFERENCES job(id)   ON DELETE CASCADE,
    CONSTRAINT fk_job_skill_skill FOREIGN KEY (skill_id) REFERENCES skill(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS application (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    job_id       BIGINT NOT NULL,
    seeker_id    BIGINT NOT NULL,
    status       ENUM('APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'OFFER') DEFAULT 'APPLIED',
    cover_letter TEXT,
    resume_url   VARCHAR(500),
    applied_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_application_job    FOREIGN KEY (job_id)    REFERENCES job(id)     ON DELETE CASCADE,
    CONSTRAINT fk_application_seeker FOREIGN KEY (seeker_id) REFERENCES `user`(id)
);

CREATE TABLE IF NOT EXISTS saved_job (
    user_id  BIGINT NOT NULL,
    job_id   BIGINT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id),
    CONSTRAINT fk_saved_job_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_job_job  FOREIGN KEY (job_id)  REFERENCES job(id)    ON DELETE CASCADE
);

CREATE INDEX idx_job_company_id     ON job(company_id);
CREATE INDEX idx_job_posted_by      ON job(posted_by);
CREATE INDEX idx_job_status         ON job(status);
CREATE INDEX idx_job_posted_at      ON job(posted_at);
CREATE INDEX idx_app_job_id         ON application(job_id);
CREATE INDEX idx_app_seeker_id      ON application(seeker_id);
CREATE INDEX idx_app_status         ON application(status);

-- ======================================================
-- PART 3: Social Tables
-- ======================================================

CREATE TABLE IF NOT EXISTS post (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    author_id     BIGINT NOT NULL,
    content       TEXT NOT NULL,
    media_url     VARCHAR(500) NULL,
    like_count    INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES `user`(id)
);

CREATE TABLE IF NOT EXISTS post_like (
    user_id    BIGINT NOT NULL,
    post_id    BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    CONSTRAINT fk_post_like_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_like_post FOREIGN KEY (post_id) REFERENCES post(id)   ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_comment (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id    BIGINT NOT NULL,
    author_id  BIGINT NOT NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_comment_post   FOREIGN KEY (post_id)   REFERENCES post(id)    ON DELETE CASCADE,
    CONSTRAINT fk_post_comment_author FOREIGN KEY (author_id) REFERENCES `user`(id)
);

CREATE TABLE IF NOT EXISTS connection (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    requester_id BIGINT NOT NULL,
    addressee_id BIGINT NOT NULL,
    status       ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_connection (requester_id, addressee_id),
    CONSTRAINT fk_connection_requester FOREIGN KEY (requester_id) REFERENCES `user`(id),
    CONSTRAINT fk_connection_addressee FOREIGN KEY (addressee_id) REFERENCES `user`(id)
);

CREATE TABLE IF NOT EXISTS conversation (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversation_participant (
    conversation_id BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    PRIMARY KEY (conversation_id, user_id),
    CONSTRAINT fk_conv_part_conv FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
    CONSTRAINT fk_conv_part_user FOREIGN KEY (user_id)         REFERENCES `user`(id)
);

CREATE TABLE IF NOT EXISTS message (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    sender_id       BIGINT NOT NULL,
    content         TEXT NOT NULL,
    read_at         TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_conv   FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id)       REFERENCES `user`(id)
);

CREATE TABLE IF NOT EXISTS notification (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id    BIGINT NOT NULL,
    type       VARCHAR(50) NOT NULL,
    payload    JSON,
    read_flag  BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_log (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id    BIGINT NOT NULL,
    action      VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id   BIGINT,
    detail      TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_log_admin FOREIGN KEY (admin_id) REFERENCES `user`(id)
);

CREATE INDEX idx_post_author_id         ON post(author_id);
CREATE INDEX idx_conn_requester_id      ON connection(requester_id);
CREATE INDEX idx_conn_addressee_id      ON connection(addressee_id);
CREATE INDEX idx_message_conv_id        ON message(conversation_id);
CREATE INDEX idx_notification_user_id   ON notification(user_id);
CREATE INDEX idx_notification_read_flag ON notification(read_flag);
