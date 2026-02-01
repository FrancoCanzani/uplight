DROP INDEX `status_page_subscriber_email_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `status_page_subscriber_unique_email_idx` ON `status_page_subscriber` (`status_page_id`,`email`);