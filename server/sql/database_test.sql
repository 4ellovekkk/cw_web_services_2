CREATE DATABASE Web_Services_Cw;
GO

USE Web_Services_Cw;

-- Таблица ролей
CREATE TABLE Role
(
    id               INT IDENTITY (1, 1) PRIMARY KEY,
    role_name        NVARCHAR(200) DEFAULT 'user',
    role_privs_level INT           DEFAULT 0
);

-- Таблица факультетов
CREATE TABLE Faculties
(
    id           INT IDENTITY (1, 1) PRIMARY KEY,
    faculty_name NVARCHAR(200) UNIQUE
);

-- Таблица специальностей
CREATE TABLE Specialty
(
    id         INT IDENTITY (1, 1) PRIMARY KEY,
    faculty_id INT FOREIGN KEY REFERENCES faculties (id) ON DELETE CASCADE ON UPDATE CASCADE,
    spec_name  NVARCHAR(200) UNIQUE
);

-- Таблица пользователей
CREATE TABLE Users
(
    id           INT IDENTITY (1, 1) PRIMARY KEY,
    first_name   NVARCHAR(200) DEFAULT 'Unknown',
    middle_name  NVARCHAR(200) DEFAULT 'Unknown',
    last_name    NVARCHAR(200) DEFAULT 'Unknown',
    phone        NCHAR(15)     DEFAULT '000000000000000',
    user_type    NVARCHAR(50)  DEFAULT 'student', -- 'worker' or 'student'
    username     VARCHAR(200) UNIQUE NOT NULL,
    passwd       VARCHAR(255)  DEFAULT '',
    user_role    INT                 NOT NULL FOREIGN KEY REFERENCES role (id) ON DELETE CASCADE ON UPDATE CASCADE,
    is_locked    BIT           DEFAULT 0,
    position     NVARCHAR(200) DEFAULT 'N/A',
    is_dean      BIT           DEFAULT 0,
    specialty_id INT FOREIGN KEY REFERENCES specialty (id) ON DELETE CASCADE ON UPDATE CASCADE,
    faculty_id   INT FOREIGN KEY REFERENCES faculties (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    course       INT           DEFAULT 1,
    group_number INT           DEFAULT 0,
    is_headman   BIT           DEFAULT 0
);

-- Таблица документов
CREATE TABLE DocumentsProve
(
    id       INT IDENTITY (1,1) PRIMARY KEY,
    document VARBINARY(MAX) NOT NULL
);

-- Таблица предметов
CREATE TABLE Subject
(
    id           INT IDENTITY (1,1) PRIMARY KEY,
    name         NVARCHAR(255) DEFAULT N'testname',
    teacher_id   INT NOT NULL FOREIGN KEY REFERENCES users (id),
    has_labs     BIT           DEFAULT 0,
    hours_amount INT           DEFAULT 0
);

-- Таблица лабораторных занятий
CREATE TABLE Labs
(
    id           INT IDENTITY (1,1) PRIMARY KEY,
    subject_id   INT NOT NULL FOREIGN KEY REFERENCES Subject (id),
    teacher_id   INT FOREIGN KEY REFERENCES users (id),
    hours_amount INT DEFAULT 0
);

-- Таблица отработок
CREATE TABLE Otrabotka
(
    id          INT IDENTITY (1,1) PRIMARY KEY,
    created_by  INT                                            NOT NULL FOREIGN KEY REFERENCES users (id),
    created_at  DATETIME       DEFAULT SYSDATETIME(),
    updated_at  DATETIME       DEFAULT SYSDATETIME(),
    skipped_day DATE           DEFAULT GETDATE(),
    subject_id  INT FOREIGN KEY REFERENCES Subject (id),
    is_lab      BIT            DEFAULT 0,
    is_signed   BIT            DEFAULT 0,
    is_official BIT            DEFAULT 0,
    proof_id    INT FOREIGN KEY REFERENCES DocumentsProve (id) NULL,
    total_cost  DECIMAL(10, 2) DEFAULT 0.00
);

-- Таблица заявлений на пропуск
CREATE TABLE SkipDay
(
    id         INT IDENTITY (1,1) PRIMARY KEY,
    created_by INT NOT NULL FOREIGN KEY REFERENCES users (id),
    created_at DATETIME DEFAULT SYSDATETIME(),
    updated_at DATETIME DEFAULT SYSDATETIME(),
    is_signed  BIT      DEFAULT 0
);

-- Таблица заявлений студентов
CREATE TABLE Student_inquiry
(
    id         INT IDENTITY (1,1) PRIMARY KEY,
    created_at DATETIME DEFAULT SYSDATETIME(),
    updated_at DATETIME DEFAULT SYSDATETIME(),
    owner_id   INT NOT NULL FOREIGN KEY REFERENCES users (id)
);