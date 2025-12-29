CREATE TABLE `heartbeat` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`grace_period` integer NOT NULL,
	`status` text DEFAULT 'initializing' NOT NULL,
	`last_ping_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `heartbeat_slug_unique` ON `heartbeat` (`slug`);--> statement-breakpoint
CREATE INDEX `heartbeat_teamId_idx` ON `heartbeat` (`team_id`);--> statement-breakpoint
CREATE INDEX `heartbeat_slug_idx` ON `heartbeat` (`slug`);--> statement-breakpoint
CREATE INDEX `heartbeat_status_idx` ON `heartbeat` (`status`);--> statement-breakpoint
CREATE TABLE `heartbeat_incident` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`heartbeat_id` integer NOT NULL,
	`cause` text NOT NULL,
	`status` text DEFAULT 'ongoing' NOT NULL,
	`started_at` integer NOT NULL,
	`resolved_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`heartbeat_id`) REFERENCES `heartbeat`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `heartbeat_incident_heartbeat_idx` ON `heartbeat_incident` (`heartbeat_id`);--> statement-breakpoint
CREATE INDEX `heartbeat_incident_status_idx` ON `heartbeat_incident` (`heartbeat_id`,`status`);