CREATE TABLE `status_page` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`logo_key` text,
	`is_public` integer DEFAULT true NOT NULL,
	`show_historical_uptime` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `status_page_slug_unique` ON `status_page` (`slug`);--> statement-breakpoint
CREATE INDEX `status_page_teamId_idx` ON `status_page` (`team_id`);--> statement-breakpoint
CREATE INDEX `status_page_slug_idx` ON `status_page` (`slug`);--> statement-breakpoint
CREATE TABLE `status_page_group` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status_page_id` integer NOT NULL,
	`label` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`status_page_id`) REFERENCES `status_page`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `status_page_group_page_idx` ON `status_page_group` (`status_page_id`);--> statement-breakpoint
CREATE INDEX `status_page_group_order_idx` ON `status_page_group` (`status_page_id`,`display_order`);--> statement-breakpoint
CREATE TABLE `status_page_monitor` (
	`status_page_id` integer NOT NULL,
	`monitor_id` integer NOT NULL,
	`group_id` integer,
	`display_order` integer DEFAULT 0 NOT NULL,
	`display_name` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`status_page_id`, `monitor_id`),
	FOREIGN KEY (`status_page_id`) REFERENCES `status_page`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`monitor_id`) REFERENCES `monitor`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `status_page_group`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `status_page_monitor_page_idx` ON `status_page_monitor` (`status_page_id`);--> statement-breakpoint
CREATE INDEX `status_page_monitor_monitor_idx` ON `status_page_monitor` (`monitor_id`);--> statement-breakpoint
CREATE INDEX `status_page_monitor_group_idx` ON `status_page_monitor` (`group_id`);--> statement-breakpoint
CREATE TABLE `status_page_subscriber` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status_page_id` integer NOT NULL,
	`email` text NOT NULL,
	`is_verified` integer DEFAULT false NOT NULL,
	`verification_token` text,
	`subscribed_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`status_page_id`) REFERENCES `status_page`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `status_page_subscriber_page_idx` ON `status_page_subscriber` (`status_page_id`);--> statement-breakpoint
CREATE INDEX `status_page_subscriber_email_idx` ON `status_page_subscriber` (`status_page_id`,`email`);