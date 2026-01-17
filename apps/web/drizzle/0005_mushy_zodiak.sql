CREATE TABLE `heartbeat_ping` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`heartbeat_id` integer NOT NULL,
	`pinged_at` integer NOT NULL,
	FOREIGN KEY (`heartbeat_id`) REFERENCES `heartbeat`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `heartbeat_ping_heartbeat_idx` ON `heartbeat_ping` (`heartbeat_id`);--> statement-breakpoint
CREATE INDEX `heartbeat_ping_pinged_at_idx` ON `heartbeat_ping` (`pinged_at`);--> statement-breakpoint
CREATE INDEX `heartbeat_ping_heartbeat_pinged_idx` ON `heartbeat_ping` (`heartbeat_id`,`pinged_at`);