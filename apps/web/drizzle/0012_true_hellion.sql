CREATE TABLE `browser_check_result` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`check_result_id` integer NOT NULL,
	`screenshot_key` text,
	`har_key` text,
	`console_logs` text,
	`console_errors` text,
	`script_error` text,
	`first_contentful_paint` integer,
	`largest_contentful_paint` integer,
	`time_to_interactive` integer,
	`total_blocking_time` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`check_result_id`) REFERENCES `check_result`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `browser_check_result_checkResultId_idx` ON `browser_check_result` (`check_result_id`);--> statement-breakpoint
CREATE TABLE `browser_script` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`code` text NOT NULL,
	`is_template` integer DEFAULT false NOT NULL,
	`template_category` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `browser_script_team_idx` ON `browser_script` (`team_id`);--> statement-breakpoint
CREATE INDEX `browser_script_template_idx` ON `browser_script` (`is_template`);--> statement-breakpoint
ALTER TABLE `monitor` ADD `browser_script_id` integer REFERENCES browser_script(id);--> statement-breakpoint
ALTER TABLE `monitor` ADD `browser_options` text;--> statement-breakpoint
ALTER TABLE `monitor` ADD `capture_screenshot` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `monitor` ADD `capture_console` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `monitor` ADD `capture_har` integer DEFAULT false;