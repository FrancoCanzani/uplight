CREATE TABLE `provider_status` (
	`provider` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`description` text,
	`since_ms` integer,
	`polled_at_ms` integer NOT NULL,
	`source_url` text NOT NULL,
	`raw_json` text NOT NULL,
	`updated_at_ms` integer NOT NULL
);
