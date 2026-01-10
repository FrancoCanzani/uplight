PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notifier` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`type` text NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`config` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_notifier`("id", "team_id", "type", "enabled", "config", "created_at", "updated_at") SELECT "id", "team_id", "type", "enabled", "config", "created_at", "updated_at" FROM `notifier`;--> statement-breakpoint
DROP TABLE `notifier`;--> statement-breakpoint
ALTER TABLE `__new_notifier` RENAME TO `notifier`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `notifier_teamId_idx` ON `notifier` (`team_id`);--> statement-breakpoint
CREATE INDEX `notifier_type_idx` ON `notifier` (`type`);--> statement-breakpoint
CREATE INDEX `notifier_enabled_idx` ON `notifier` (`enabled`);--> statement-breakpoint
ALTER TABLE `monitor` DROP COLUMN `verify_ssl`;--> statement-breakpoint
ALTER TABLE `monitor` DROP COLUMN `check_dns`;