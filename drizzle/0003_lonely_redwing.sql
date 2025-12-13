CREATE TABLE `team` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`personal` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_slug_unique` ON `team` (`slug`);--> statement-breakpoint
CREATE TABLE `team_member` (
	`teamId` integer NOT NULL,
	`userId` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`teamId`, `userId`),
	FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `team_member_userId_idx` ON `team_member` (`userId`);--> statement-breakpoint
CREATE INDEX `team_member_teamId_idx` ON `team_member` (`teamId`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_monitor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teamId` integer NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`interval` integer NOT NULL,
	`timeout` integer DEFAULT 30 NOT NULL,
	`locations` text NOT NULL,
	`contentCheck` text,
	`url` text,
	`method` text,
	`headers` text,
	`body` text,
	`username` text,
	`password` text,
	`expectedStatusCodes` text,
	`followRedirects` integer DEFAULT true NOT NULL,
	`verifySSL` integer DEFAULT true NOT NULL,
	`checkDNS` integer DEFAULT true NOT NULL,
	`host` text,
	`port` integer,
	`status` text DEFAULT 'initializing' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_monitor`("id", "teamId", "type", "name", "interval", "timeout", "locations", "contentCheck", "url", "method", "headers", "body", "username", "password", "expectedStatusCodes", "followRedirects", "verifySSL", "checkDNS", "host", "port", "status", "createdAt", "updatedAt") SELECT "id", "teamId", "type", "name", "interval", "timeout", "locations", "contentCheck", "url", "method", "headers", "body", "username", "password", "expectedStatusCodes", "followRedirects", "verifySSL", "checkDNS", "host", "port", "status", "createdAt", "updatedAt" FROM `monitor`;--> statement-breakpoint
DROP TABLE `monitor`;--> statement-breakpoint
ALTER TABLE `__new_monitor` RENAME TO `monitor`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `monitor_teamId_idx` ON `monitor` (`teamId`);--> statement-breakpoint
CREATE INDEX `monitor_type_idx` ON `monitor` (`type`);--> statement-breakpoint
CREATE INDEX `monitor_status_idx` ON `monitor` (`status`);