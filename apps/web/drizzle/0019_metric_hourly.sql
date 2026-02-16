CREATE TABLE `metric_hourly` (
  `monitor_id` integer NOT NULL,
  `location` text NOT NULL,
  `hour` integer NOT NULL,
  `avg_response_ms` real,
  `p95_response_ms` real,
  `error_rate` real,
  `check_count` integer NOT NULL DEFAULT 0,
  PRIMARY KEY(`monitor_id`, `location`, `hour`),
  FOREIGN KEY (`monitor_id`) REFERENCES `monitor`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `metric_hourly_monitor_hour_idx` ON `metric_hourly` (`monitor_id`, `hour`);
CREATE INDEX `metric_hourly_hour_idx` ON `metric_hourly` (`hour`);
