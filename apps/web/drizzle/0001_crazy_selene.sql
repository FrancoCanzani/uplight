CREATE TABLE `maintenance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monitor_id` integer NOT NULL,
	`reason` text,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`monitor_id`) REFERENCES `monitor`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `maintenance_monitor_idx` ON `maintenance` (`monitor_id`);--> statement-breakpoint
CREATE INDEX `maintenance_active_idx` ON `maintenance` (`starts_at`,`ends_at`);--> statement-breakpoint