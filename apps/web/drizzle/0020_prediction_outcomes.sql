CREATE TABLE `analyst_prediction_outcomes` (
  `id` text PRIMARY KEY NOT NULL,
  `finding_id` text NOT NULL,
  `monitor_id` integer NOT NULL,
  `predicted_at_ms` integer NOT NULL,
  `evaluate_at_ms` integer NOT NULL,
  `horizon` text NOT NULL,
  `failure_probability` real NOT NULL,
  `outcome` text NOT NULL DEFAULT 'pending',
  `evidence` text,
  `evaluated_at_ms` integer,
  `created_at_ms` integer NOT NULL,
  FOREIGN KEY (`monitor_id`) REFERENCES `monitor`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`finding_id`) REFERENCES `analyst_findings`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `analyst_prediction_outcomes_finding_idx`
ON `analyst_prediction_outcomes` (`finding_id`);

CREATE INDEX `analyst_prediction_outcomes_monitor_idx`
ON `analyst_prediction_outcomes` (`monitor_id`, `predicted_at_ms`);

CREATE INDEX `analyst_prediction_outcomes_due_idx`
ON `analyst_prediction_outcomes` (`outcome`, `evaluate_at_ms`);
