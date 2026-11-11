-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 28, 2024 at 08:30 AM
-- Server version: 8.0.31
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `contact_api`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` varchar(100) NOT NULL,
  `contact_id` varchar(100) NOT NULL,
  `street` varchar(200) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `country` varchar(100) NOT NULL,
  `postal_code` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_contacts_addresses` (`contact_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `contact_id`, `street`, `city`, `province`, `country`, `postal_code`) VALUES
('17a1658b-fa90-4fb6-be59-6a342c12ba28', '492c65d0-0ff7-4c21-90a0-bfdad5486363', 'jeki', 'semarang', 'jawa tengah', 'Indonesia', '9019'),
('19183831-9e90-4a31-93fd-6bc60733ad83', '492c65d0-0ff7-4c21-90a0-bfdad5486363', 'jalan 1', 'semarang1', 'jawa tengah1', 'Indonesia1', '90191'),
('201d91a7-d788-44dc-9a56-e8b6ddc3224b', '492c65d0-0ff7-4c21-90a0-bfdad5486363', 'jalan', 'semarang', 'jawa tengah', 'Indonesia', '9019'),
('af86f1fa-e460-4c1a-9ff5-c21c229e85ae', '492c65d0-0ff7-4c21-90a0-bfdad5486363', 'jalan 1', 'semarang1', 'jawa tengah1', 'Indonesia1', '90191'),
('b2f5e3b1-e0fa-4fcc-8971-7ad37d3251d5', '492c65d0-0ff7-4c21-90a0-bfdad5486363', 'jalan 1', 'semarang1', 'jawa tengah1', 'Indonesia1', '90191');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_users_contacts` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `username`, `first_name`, `last_name`, `phone`, `email`) VALUES
('2f790019-6fbd-49d0-8d95-39b75539cada', 'lana', 'ahmad', 'Fadil', '12345678901', 'example@email.com'),
('31a8e974-33e6-4d14-aaa1-7954463ab75f', 'lana', 'Ika', 'fadila', '12345678', 'example@email.com'),
('492c65d0-0ff7-4c21-90a0-bfdad5486363', 'lana', 'ahmad', 'Fadil', '12345678901', 'example@email.com'),
('52f3a994-391c-4d50-abe5-cf9ec619ac81', 'lana', 'jeki', 'joks', '12345678901', 'example@email.com'),
('b780e11e-5502-4e16-9e74-1205d6a35fd4', 'lana', 'Supri', 'Yanto', '12345678901', 'example@email.com'),
('b9ba881b-bc70-425a-a0fc-d19bac3cd949', 'lana', 'ahmad', 'Fadil', '12345678901', 'example@email.com'),
('ec047342-2dc0-4643-a26b-b4d9bdc1cf2f', 'lana', 'ahmad', 'Fadil', '12345678901', 'example@email.com');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `token` varchar(100) DEFAULT NULL,
  `token_expired_at` bigint DEFAULT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`username`, `password`, `name`, `token`, `token_expired_at`) VALUES
('lana', '$2a$10$odWGZ4YLG692tmtKNcc2VepdcLovSXMIRVFLsIIxuhmBs19JoPEdW', 'Muhammad Lana Jauhar', '8086a574-102a-4ce8-a9bd-7cdb7dfdaf05', 1710258677050);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`);

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`username`) REFERENCES `users` (`username`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
