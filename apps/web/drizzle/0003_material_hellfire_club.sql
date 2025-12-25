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
CREATE INDEX `domain_check_checked_at_idx` ON `domain_check_result` (`checked_at`);