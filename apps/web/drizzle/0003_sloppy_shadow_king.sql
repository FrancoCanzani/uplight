CREATE TABLE `incident_activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`incident_id` integer NOT NULL,
	`user_id` text,
	`type` text NOT NULL,
	`content` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`incident_id`) REFERENCES `incident`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `incident_activity_incident_idx` ON `incident_activity` (`incident_id`);--> statement-breakpoint
CREATE INDEX `incident_activity_created_idx` ON `incident_activity` (`created_at`);--> statement-breakpoint
CREATE TABLE `incident_role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`incident_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`assigned_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`incident_id`) REFERENCES `incident`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `incident_role_incident_idx` ON `incident_role` (`incident_id`);--> statement-breakpoint
CREATE INDEX `incident_role_user_idx` ON `incident_role` (`user_id`);--> statement-breakpoint
ALTER TABLE `incident` ADD `incident_type` text;--> statement-breakpoint
ALTER TABLE `incident` ADD `recovered_at` integer;