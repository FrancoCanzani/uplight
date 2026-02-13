ALTER TABLE `monitor` ADD `dns_record_type` text;
ALTER TABLE `monitor` ADD `dns_expected_value` text;
ALTER TABLE `monitor` ADD `dns_resolver` text DEFAULT 'cloudflare' NOT NULL;

UPDATE `monitor`
SET
  `dns_record_type` = `dnsRecordType`,
  `dns_expected_value` = `dnsExpectedValue`,
  `dns_resolver` = COALESCE(`dnsResolver`, `dns_resolver`)
WHERE `type` = 'dns';
