use master;

GO
;

CREATE DATABASE web_services_cw;

GO
;

USE web_services_cw;

-- Таблица ролей
CREATE TABLE role (
    id INT IDENTITY (1, 1) PRIMARY KEY,
    role_name NVARCHAR(200),
    role_privs_level INT
);

-- Таблица факультетов
CREATE TABLE faculties (
    id INT IDENTITY (1, 1) PRIMARY KEY,
    faculty_name NVARCHAR(200) unique
);

-- Таблица специальностей
CREATE TABLE specialty (
    id INT IDENTITY (1, 1) PRIMARY KEY,
    faculty INT FOREIGN KEY REFERENCES faculties (id) ON DELETE CASCADE ON UPDATE CASCADE,
    spec_name NVARCHAR(200) unique
);

-- Общая таблица пользователей
CREATE TABLE users (
    id INT IDENTITY (1, 1) PRIMARY KEY,
    first_name NVARCHAR(200),
    midle_name NVARCHAR(200),
    last_name NVARCHAR(200),
    phone NCHAR(15),
    user_type NVARCHAR(50),
    -- Тип пользователя: 'worker' или 'student'
    username VARCHAR(200) UNIQUE NOT NULL,
    passwd VARCHAR(255),
    user_role INT FOREIGN KEY REFERENCES role (id) ON DELETE CASCADE ON UPDATE CASCADE,
    is_locked BIT,
    position NVARCHAR(200),
    is_dean BIT,
    specialty INT FOREIGN KEY REFERENCES specialty (id) ON DELETE CASCADE ON UPDATE CASCADE,
    faculty INT FOREIGN KEY REFERENCES faculties (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    group_number INT,
    is_headman BIT
);

-- Таблица типов документов
CREATE TABLE document_types (
    id INT IDENTITY (1, 1) PRIMARY KEY,
    document_name NVARCHAR(200),
    is_payment_mandatory BIT
);

-- Таблица документов
CREATE TABLE documents (
    id INT IDENTITY (1, 1) PRIMARY KEY,
    -- SERIAL заменен на IDENTITY, так как это SQL Server
    document_type_id INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    -- Используем NVARCHAR(MAX) вместо TEXT, так как TEXT устарел в SQL Server
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (document_type_id) REFERENCES document_types (id) ON DELETE CASCADE ON UPDATE CASCADE,
    is_approved BIT,
    is_dean_required BIT
);

-- Insert into the role table
INSERT INTO
    [role] (role_name, role_privs_level)
VALUES
    ('Admin', 0),
    ('Worker', 1),
    ('Student', 2);

-- Insert into the users table
INSERT INTO
    users (username, passwd, user_role)
VALUES
    (
        'lexa',
        '$2a$10$j8VyepsXZoJYSiJY8MOGseLfYhdVKUR7MHViQ1Lr8TK.tLHLDXvhe',
        1
    ),
    (
        'shiman',
        '$2a$10$j8VyepsXZoJYSiJY8MOGseLfYhdVKUR7MHViQ1Lr8TK.tLHLDXvhe',
        2
    ),
    (
        'test',
        '$2a$10$j8VyepsXZoJYSiJY8MOGseLfYhdVKUR7MHViQ1Lr8TK.tLHLDXvhe',
        3
    );

-- Select from role table
SELECT
    *
FROM
    [role];

-- Select from users table
SELECT
    *
FROM
    users;