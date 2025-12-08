-- Create main user
CREATE USER IF NOT EXISTS 'docrecords'@'%' IDENTIFIED BY 'Doc_Records123';
GRANT ALL PRIVILEGES ON *.* TO 'docrecords'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Just in case the dump doesn’t include CREATE DATABASE
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS patient_db;
CREATE DATABASE IF NOT EXISTS prescription_db;
CREATE DATABASE IF NOT EXISTS profile_db;
CREATE DATABASE IF NOT EXISTS docrecords;

-- Import the dump
-- Note: This line doesn’t work directly in SQL, Docker will import the .sql separately.

