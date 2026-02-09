DROP TABLE `browser_script`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_monitor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`interval` integer NOT NULL,
	`timeout` integer DEFAULT 30 NOT NULL,
	`response_time_threshold` integer,
	`locations` text NOT NULL,
	`content_check` text,
	`url` text,
	`method` text,
	`headers` text,
	`body` text,
	`username` text,
	`password` text,
	`expected_status_codes` text,
	`follow_redirects` integer DEFAULT true NOT NULL,
	`check_domain` integer DEFAULT true NOT NULL,
	`host` text,
	`port` integer,
	`status` text DEFAULT 'initializing' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_monitor`("id", "team_id", "type", "name", "interval", "timeout", "response_time_threshold", "locations", "content_check", "url", "method", "headers", "body", "username", "password", "expected_status_codes", "follow_redirects", "check_domain", "host", "port", "status", "created_at", "updated_at") SELECT "id", "team_id", "type", "name", "interval", "timeout", "response_time_threshold", "locations", "content_check", "url", "method", "headers", "body", "username", "password", "expected_status_codes", "follow_redirects", "check_domain", "host", "port", "status", "created_at", "updated_at" FROM `monitor`;--> statement-breakpoint
DROP TABLE `monitor`;--> statement-breakpoint
ALTER TABLE `__new_monitor` RENAME TO `monitor`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `monitor_teamId_idx` ON `monitor` (`team_id`);--> statement-breakpoint
CREATE INDEX `monitor_type_idx` ON `monitor` (`type`);--> statement-breakpoint
CREATE INDEX `monitor_status_idx` ON `monitor` (`status`);--> statement-breakpoint
ALTER TABLE `browser_check_result` DROP COLUMN `har_key`;--> statement-breakpoint
ALTER TABLE `browser_check_result` DROP COLUMN `script_error`;