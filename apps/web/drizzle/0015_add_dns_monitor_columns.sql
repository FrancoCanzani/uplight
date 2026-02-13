ALTER TABLE `monitor` ADD `dnsRecordType` text;
ALTER TABLE `monitor` ADD `dnsExpectedValue` text;
ALTER TABLE `monitor` ADD `dnsResolver` text DEFAULT 'cloudflare' NOT NULL;
