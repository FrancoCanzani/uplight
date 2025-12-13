PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_monitor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
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
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_monitor`("id", "userId", "type", "name", "interval", "timeout", "locations", "contentCheck", "url", "method", "headers", "body", "username", "password", "expectedStatusCodes", "followRedirects", "verifySSL", "checkDNS", "host", "port", "status", "createdAt", "updatedAt") SELECT "id", "userId", "type", "name", "interval", "timeout", "locations", "contentCheck", "url", "method", "headers", "body", "username", "password", "expectedStatusCodes", "followRedirects", "verifySSL", "checkDNS", "host", "port", "status", "createdAt", "updatedAt" FROM `monitor`;--> statement-breakpoint
DROP TABLE `monitor`;--> statement-breakpoint
ALTER TABLE `__new_monitor` RENAME TO `monitor`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `monitor_userId_idx` ON `monitor` (`userId`);--> statement-breakpoint
CREATE INDEX `monitor_type_idx` ON `monitor` (`type`);--> statement-breakpoint
CREATE INDEX `monitor_status_idx` ON `monitor` (`status`);