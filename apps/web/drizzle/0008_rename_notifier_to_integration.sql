ALTER TABLE `notifier` RENAME TO `integration`;--> statement-breakpoint
DROP INDEX IF EXISTS `notifier_teamId_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `notifier_type_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `notifier_enabled_idx`;--> statement-breakpoint
CREATE INDEX `integration_teamId_idx` ON `integration` (`team_id`);--> statement-breakpoint
CREATE INDEX `integration_type_idx` ON `integration` (`type`);--> statement-breakpoint
CREATE INDEX `integration_enabled_idx` ON `integration` (`enabled`);
