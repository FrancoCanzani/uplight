CREATE TABLE `incident_mention` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`incident_id` integer NOT NULL,
	`activity_id` integer NOT NULL,
	`mentioned_user_id` text NOT NULL,
	`mentioned_by_user_id` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`incident_id`) REFERENCES `incident`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`activity_id`) REFERENCES `incident_activity`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mentioned_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mentioned_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `incident_mention_user_idx` ON `incident_mention` (`mentioned_user_id`);--> statement-breakpoint
CREATE INDEX `incident_mention_activity_idx` ON `incident_mention` (`activity_id`);