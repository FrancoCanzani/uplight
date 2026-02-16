CREATE TABLE `monitor_baselines` (
  `monitor_id` integer PRIMARY KEY NOT NULL,
  `avg_response_ms` real,
  `p95_response_ms` real,
  `avg_error_rate` real,
  `computed_at` integer NOT NULL,
  `sample_count` integer NOT NULL DEFAULT 0,
  FOREIGN KEY (`monitor_id`) REFERENCES `monitor`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `analyst_findings` (
  `id` text PRIMARY KEY NOT NULL,
  `monitor_id` integer NOT NULL,
  `created_at` integer NOT NULL,
  `severity` text NOT NULL,
  `anomalies` text,
  `prediction` text,
  `summary` text,
  `notified` integer NOT NULL DEFAULT 0,
  FOREIGN KEY (`monitor_id`) REFERENCES `monitor`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `analyst_findings_monitor_created_idx` ON `analyst_findings` (`monitor_id`,`created_at`);
CREATE INDEX `analyst_findings_created_idx` ON `analyst_findings` (`created_at`);
