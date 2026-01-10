CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `check_result` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monitor_id` integer NOT NULL,
	`location` text NOT NULL,
	`result` text NOT NULL,
	`response_time` integer NOT NULL,
	`status_code` integer,
	`error_message` text,
	`response_headers` text,
	`response_body` text,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`checked_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`monitor_id`) REFERENCES `monitor`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `check_result_monitor_idx` ON `check_result` (`monitor_id`);--> statement-breakpoint
CREATE INDEX `check_result_checked_at_idx` ON `check_result` (`checked_at`);--> statement-breakpoint
CREATE INDEX `check_result_monitor_checked_idx` ON `check_result` (`monitor_id`,`checked_at`);--> statement-breakpoint
CREATE TABLE `domain_check_result` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monitor_id` integer NOT NULL,
	`domain` text NOT NULL,
	`whois_created_date` text,
	`whois_updated_date` text,
	`whois_expiration_date` text,
	`whois_registrar` text,
	`whois_error` text,
	`ssl_issuer` text,
	`ssl_expiry` integer,
	`ssl_is_self_signed` integer,
	`ssl_error` text,
	`checked_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`monitor_id`) REFERENCES `monitor`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `domain_check_monitor_idx` ON `domain_check_result` (`monitor_id`);--> statement-breakpoint
CREATE INDEX `domain_check_checked_at_idx` ON `domain_check_result` (`checked_at`);--> statement-breakpoint
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
CREATE INDEX `heartbeat_incident_status_idx` ON `heartbeat_incident` (`heartbeat_id`,`status`);--> statement-breakpoint
CREATE TABLE `incident` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monitor_id` integer NOT NULL,
	`cause` text NOT NULL,
	`title` text,
	`description` text,
	`hint` text,
	`severity` text,
	`status` text DEFAULT 'active' NOT NULL,
	`post_mortem_title` text,
	`post_mortem_content` text,
	`started_at` integer NOT NULL,
	`acknowledged_at` integer,
	`fixing_at` integer,
	`resolved_at` integer,
	FOREIGN KEY (`monitor_id`) REFERENCES `monitor`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `incident_monitor_idx` ON `incident` (`monitor_id`);--> statement-breakpoint
CREATE INDEX `incident_monitor_status_idx` ON `incident` (`monitor_id`,`status`);--> statement-breakpoint
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
CREATE TABLE `monitor` (
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
	`verify_ssl` integer DEFAULT true NOT NULL,
	`check_dns` integer DEFAULT true NOT NULL,
	`check_domain` integer DEFAULT true NOT NULL,
	`host` text,
	`port` integer,
	`status` text DEFAULT 'initializing' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `monitor_teamId_idx` ON `monitor` (`team_id`);--> statement-breakpoint
CREATE INDEX `monitor_type_idx` ON `monitor` (`type`);--> statement-breakpoint
CREATE INDEX `monitor_status_idx` ON `monitor` (`status`);--> statement-breakpoint
CREATE TABLE `notifier` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`config` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifier_teamId_idx` ON `notifier` (`team_id`);--> statement-breakpoint
CREATE INDEX `notifier_type_idx` ON `notifier` (`type`);--> statement-breakpoint
CREATE INDEX `notifier_enabled_idx` ON `notifier` (`enabled`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `team` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`personal` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `team_member` (
	`team_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`team_id`, `user_id`),
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `team_member_userId_idx` ON `team_member` (`user_id`);--> statement-breakpoint
CREATE INDEX `team_member_teamId_idx` ON `team_member` (`team_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);