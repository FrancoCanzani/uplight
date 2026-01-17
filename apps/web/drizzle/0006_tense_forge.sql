ALTER TABLE `heartbeat` ADD `period` integer DEFAULT 86400 NOT NULL;--> statement-breakpoint
ALTER TABLE `heartbeat_ping` ADD `method` text DEFAULT 'GET' NOT NULL;--> statement-breakpoint
ALTER TABLE `heartbeat_ping` ADD `user_agent` text;--> statement-breakpoint
ALTER TABLE `heartbeat_ping` ADD `ip` text;