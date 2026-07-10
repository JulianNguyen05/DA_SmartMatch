-- =========================================
-- 1. CREATE DATABASE & USER CHO WORKLIFY
-- =========================================
CREATE DATABASE IF NOT EXISTS worklify_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo User riêng cho hệ thống Worklify (Nên đổi mật khẩu khi đưa lên production)
CREATE USER IF NOT EXISTS 'worklify'@'%' IDENTIFIED BY 'worklify_password';
GRANT ALL PRIVILEGES ON worklify_db.* TO 'worklify'@'%';
FLUSH PRIVILEGES;

USE worklify_db;

-- =========================================
-- 2. SCHEMA — cập nhật khớp với dữ liệu thực tế trên phpMyAdmin (09/07/2026)
-- Thay đổi so với bản init.sql cũ:
--   + Thêm 8 bảng: candidate_educations, candidate_experiences, candidate_projects,
--     candidate_certifications, candidate_activities, candidate_awards,
--     candidate_hobbies, candidate_languages
--   + Thêm bảng reference_values, reference_value_suggestions (thay cho bảng "skills" cũ)
--   + Thêm bảng candidate_profile_layouts (MỚI — sandbox kéo-thả ProfilePage)
--   + candidate_profiles: thêm avatar_url, headline, email_contact, website_url,
--     linkedin_url, github_url
--   + candidate_skills: skill_id giờ trỏ tới reference_values thay vì bảng skills cũ
--   + cv_documents: thay raw_text bằng cv_data (JSON) + thumbnail_path
--   + applications: thêm cột blind_test_url
-- =========================================

-- ============================================================
-- worklify_db — CREATE TABLE khớp đúng cấu hình hiện tại trên phpMyAdmin
-- (gộp PRIMARY KEY / AUTO_INCREMENT / FOREIGN KEY inline thay vì tách ALTER TABLE
--  như file phpMyAdmin export, để dễ đọc và chạy lại)
-- Thứ tự bảng tôn trọng phụ thuộc khóa ngoại.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS applications, saved_jobs, job_postings, cv_documents,
    candidate_profile_layouts, candidate_languages, candidate_hobbies, candidate_awards,
    candidate_activities, candidate_certifications, candidate_projects, candidate_experiences,
    candidate_educations, candidate_skills, reference_value_suggestions, reference_values,
    candidate_profiles, company_likes, company_profiles, system_logs, demo_products, users;

-- =========================================
-- USERS
-- =========================================
CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(191) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL COMMENT 'ADMIN, EMPLOYER, CANDIDATE',
    status          VARCHAR(50) DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, BANNED',
    is_mfa_enabled  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- EMPLOYER
-- =========================================
CREATE TABLE company_profiles (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id               BIGINT NOT NULL,
    company_name          VARCHAR(255) NOT NULL,
    logo_url              VARCHAR(500),
    website               VARCHAR(255),
    description           TEXT,
    verification_status   VARCHAR(50) DEFAULT 'PENDING' COMMENT 'PENDING, APPROVED, REJECTED',
    CONSTRAINT fk_company_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE company_likes (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    company_id  BIGINT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_company (user_id, company_id),
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_like_company FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- CANDIDATE — PROFILE
-- =========================================
CREATE TABLE candidate_profiles (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT NOT NULL,
    full_name      VARCHAR(255) NOT NULL,
    avatar_url     VARCHAR(500) COMMENT 'Ảnh đại diện',
    headline       VARCHAR(255) COMMENT 'Chức danh / vị trí mong muốn',
    phone          VARCHAR(20),
    email_contact  VARCHAR(191) COMMENT 'Email liên hệ, có thể khác email đăng nhập',
    gender         VARCHAR(20),
    dob            DATE,
    address        VARCHAR(500),
    website_url    VARCHAR(255) COMMENT 'Website / portfolio cá nhân',
    linkedin_url   VARCHAR(255),
    github_url     VARCHAR(255),
    summary        TEXT,
    CONSTRAINT fk_candidate_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- REFERENCE DATA — dùng chung cho SKILL / LANGUAGE / ... (dropdown động)
-- =========================================
CREATE TABLE reference_values (
    id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    type  VARCHAR(50) NOT NULL,
    name  VARCHAR(255) NOT NULL,
    UNIQUE KEY uq_type_name (type, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reference_value_suggestions (
    id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
    type                   VARCHAR(50) NOT NULL,
    name                   VARCHAR(255) NOT NULL,
    requested_by_user_id   BIGINT NOT NULL,
    status                 VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, APPROVED, REJECTED',
    reviewed_by_admin_id   BIGINT,
    review_note            VARCHAR(500),
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at            TIMESTAMP NULL,
    CONSTRAINT fk_suggestion_user FOREIGN KEY (requested_by_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- CANDIDATE — CÁC BLOCK DANH SÁCH
-- =========================================
CREATE TABLE candidate_skills (
    candidate_id  BIGINT NOT NULL,
    skill_id      BIGINT NOT NULL,
    level         VARCHAR(50),
    years_of_ex   INT DEFAULT 0,
    note          VARCHAR(255),
    PRIMARY KEY (candidate_id, skill_id),
    CONSTRAINT fk_cs_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_cs_skill FOREIGN KEY (skill_id) REFERENCES reference_values(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_educations (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id   BIGINT NOT NULL,
    school_name    VARCHAR(255) NOT NULL,
    major          VARCHAR(255),
    degree         VARCHAR(100) COMMENT 'Trung cấp, Cao đẳng, Đại học, Thạc sĩ, Tiến sĩ,... (dropdown cố định)',
    start_date     DATE,
    end_date       DATE,
    is_current     BOOLEAN DEFAULT FALSE,
    gpa            DECIMAL(3,2),
    description    TEXT,
    display_order  INT DEFAULT 0,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_edu_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_experiences (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id     BIGINT NOT NULL,
    company_name     VARCHAR(255) NOT NULL,
    position         VARCHAR(255),
    employment_type  VARCHAR(50) COMMENT 'FULL_TIME, PART_TIME, INTERNSHIP, FREELANCE (dropdown cố định)',
    location         VARCHAR(255),
    start_date       DATE,
    end_date         DATE,
    is_current       BOOLEAN DEFAULT FALSE,
    description      TEXT,
    display_order    INT DEFAULT 0,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_exp_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_projects (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id   BIGINT NOT NULL,
    project_name   VARCHAR(255) NOT NULL,
    role           VARCHAR(255),
    tech_stack     VARCHAR(500) COMMENT 'Danh sách công nghệ, phân tách bởi dấu phẩy',
    project_url    VARCHAR(500),
    start_date     DATE,
    end_date       DATE,
    is_current     BOOLEAN DEFAULT FALSE,
    description    TEXT,
    display_order  INT DEFAULT 0,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_proj_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_certifications (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id    BIGINT NOT NULL,
    name            VARCHAR(255) NOT NULL,
    issuing_org     VARCHAR(255),
    issue_date      DATE,
    expiry_date     DATE,
    credential_id   VARCHAR(255),
    credential_url  VARCHAR(500),
    display_order   INT DEFAULT 0,
    CONSTRAINT fk_cert_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_activities (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id   BIGINT NOT NULL,
    organization   VARCHAR(255) NOT NULL,
    role           VARCHAR(255),
    start_date     DATE,
    end_date       DATE,
    is_current     BOOLEAN DEFAULT FALSE,
    description    TEXT,
    display_order  INT DEFAULT 0,
    CONSTRAINT fk_act_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_awards (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id   BIGINT NOT NULL,
    title          VARCHAR(255) NOT NULL,
    issuer         VARCHAR(255),
    awarded_date   DATE,
    description    TEXT,
    display_order  INT DEFAULT 0,
    CONSTRAINT fk_award_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_hobbies (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id   BIGINT NOT NULL,
    name           VARCHAR(255) NOT NULL,
    display_order  INT DEFAULT 0,
    CONSTRAINT fk_hobby_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_languages (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id   BIGINT NOT NULL,
    language_id    BIGINT NOT NULL,
    proficiency    VARCHAR(50) COMMENT 'Cơ bản, Trung cấp, Thành thạo, Bản ngữ (dropdown cố định)',
    display_order  INT DEFAULT 0,
    UNIQUE KEY uq_candidate_language (candidate_id, language_id),
    CONSTRAINT fk_lang_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_lang_ref FOREIGN KEY (language_id) REFERENCES reference_values(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- CANDIDATE — PROFILE LAYOUT (SANDBOX KÉO-THẢ) — [MỚI - Tiến độ 3]
-- =========================================
CREATE TABLE candidate_profile_layouts (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id   BIGINT NOT NULL,
    block_type     VARCHAR(50) NOT NULL COMMENT 'PERSONAL_INFO, AVATAR, SOCIAL_LINKS, ACTIVITY, AWARD, SKILL, CERTIFICATION, EDUCATION, EXPERIENCE, HOBBY, LANGUAGE, PROJECT',
    position       INT NOT NULL DEFAULT 0,
    visible        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_candidate_block (candidate_id, block_type),
    CONSTRAINT fk_layout_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- CV DOCUMENTS — thuộc CV Builder (không thay đổi ở phase ProfilePage)
-- =========================================
CREATE TABLE cv_documents (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id    BIGINT NOT NULL,
    file_name       VARCHAR(255),
    file_path       VARCHAR(500),
    cv_data         JSON COMMENT 'Lưu toàn bộ state của CV Builder (layout, content, settings)',
    is_generated    BOOLEAN DEFAULT FALSE,
    thumbnail_path  VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cv_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- JOB
-- =========================================
CREATE TABLE job_postings (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id     BIGINT NOT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT NOT NULL,
    requirements   TEXT,
    salary_range   VARCHAR(100),
    location       VARCHAR(255),
    work_type      VARCHAR(50),
    status         VARCHAR(50) DEFAULT 'PENDING' COMMENT 'PENDING, ACTIVE, CLOSED, REJECTED',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at     TIMESTAMP NULL,
    CONSTRAINT fk_job_company FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE saved_jobs (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id  BIGINT NOT NULL,
    job_id        BIGINT NOT NULL,
    saved_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_candidate_job (candidate_id, job_id),
    CONSTRAINT fk_saved_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_job FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- APPLICATIONS
-- =========================================
CREATE TABLE applications (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id   BIGINT NOT NULL,
    job_id         BIGINT NOT NULL,
    cv_id          BIGINT,
    cover_letter   TEXT,
    status         VARCHAR(50) DEFAULT 'PENDING' COMMENT 'PENDING, REVIEWED, INTERVIEW_SCHEDULED, ACCEPTED, REJECTED',
    applied_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blind_test_url VARCHAR(255),
    UNIQUE KEY uk_job_candidate (job_id, candidate_id),
    CONSTRAINT fk_app_candidate FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_cv FOREIGN KEY (cv_id) REFERENCES cv_documents(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- SYSTEM
-- =========================================
CREATE TABLE system_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    action      VARCHAR(255) NOT NULL,
    details     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE demo_products (
    id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    name   VARCHAR(255) NOT NULL,
    price  DOUBLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;