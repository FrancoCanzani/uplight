PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_incident` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monitor_id` integer NOT NULL,
	`cause` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` integer NOT NULL,
	`acknowledged_at` integer,
	`fixing_at` integer,
	`resolved_at` integer,
	FOREIGN KEY (`monitor_id`) REFERENCES `monitor`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_incident`("id", "monitor_id", "cause", "status", "started_at", "acknowledged_at", "fixing_at", "resolved_at") SELECT "id", "monitor_id", "cause", "status", "started_at", "acknowledged_at", "fixing_at", "resolved_at" FROM `incident`;--> statement-breakpoint
DROP TABLE `incident`;--> statement-breakpoint
ALTER TABLE `__new_incident` RENAME TO `incident`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `incident_monitor_idx` ON `incident` (`monitor_id`);--> statement-breakpoint
CREATE INDEX `incident_monitor_status_idx` ON `incident` (`monitor_id`,`status`);