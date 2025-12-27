ALTER TABLE `monitor` ADD `response_time_threshold` integer;--> statement-breakpoint
ALTER TABLE `monitor` ADD `check_domain` integer DEFAULT true NOT NULL;