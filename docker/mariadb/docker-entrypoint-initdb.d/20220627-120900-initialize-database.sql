-- 2022-06-27 12:09 initial setup

USE nextdns;

CREATE TABLE IF NOT EXISTS `devices` (
  `id` char(128) NOT NULL,
  `name` char(255),
  `model` char(255),
  `localIp` char(32),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
);

CREATE TABLE IF NOT EXISTS `logs` (
  `id` char(255) NOT NULL,
  `timestamp` datetime DEFAULT NULL,
  `domain` char(255) DEFAULT NULL,
  `root` char(255) DEFAULT NULL,
  `tracker` char(255) DEFAULT NULL,
  `encrypted` tinyint(1) DEFAULT NULL,
  `protocol` char(255) DEFAULT NULL,
  `clientIp` char(32) DEFAULT NULL,
  `client` char(255) DEFAULT NULL,
  `deviceId` char(128) DEFAULT NULL,
  `status` char(128) NOT NULL,
  `reasons` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `domain` (`domain`),
  KEY `timestamp` (`timestamp`),
  KEY `deviceId` (`deviceId`),
  KEY `status` (`status`)
);