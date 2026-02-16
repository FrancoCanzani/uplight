PRAGMA foreign_keys=OFF;--> statement-breakpoint
DROP TABLE IF EXISTS `maintenance_monitor`;--> statement-breakpoint
DROP TABLE IF EXISTS `maintenance`;--> statement-breakpoint
CREATE TABLE `maintenance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`reason` text,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `maintenance_team_idx` ON `maintenance` (`team_id`);--> statement-breakpoint
CREATE INDEX `maintenance_active_idx` ON `maintenance` (`starts_at`,`ends_at`);--> statement-breakpoint
CREATE TABLE `maintenance_monitor` (
	`maintenance_id` integer NOT NULL,
	`monitor_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`maintenance_id`, `monitor_id`),
	FOREIGN KEY (`maintenance_id`) REFERENCES `maintenance`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`monitor_id`) REFERENCES `monitor`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `maintenance_monitor_maintenance_idx` ON `maintenance_monitor` (`maintenance_id`);--> statement-breakpoint
CREATE INDEX `maintenance_monitor_monitor_idx` ON `maintenance_monitor` (`monitor_id`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
