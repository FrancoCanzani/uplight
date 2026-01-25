package services

import (
	"domain-checker/internal/helpers"
	"domain-checker/internal/types"
	"fmt"
	"log"

	"github.com/likexian/whois"
	whoisparser "github.com/likexian/whois-parser"
)

func GetWhoisInfo(domain string) (*types.WhoisInfo, error) {
	log.Printf("[INFO] Fetching WHOIS data for domain: %s", domain)

	whois_raw, err := whois.Whois(domain)
	if err != nil {
		log.Printf("[ERROR] WHOIS query failed for %s: %v", domain, err)
		return nil, err
	}

	result, err := whoisparser.Parse(whois_raw)
	if err != nil {
		log.Printf("[ERROR] WHOIS parsing failed for %s: %v", domain, err)
		return nil, err
	}

	if result.Registrar.Name == "" && result.Domain.CreatedDate == "" {
		log.Printf("[WARN] Domain %s appears to be unregistered or WHOIS data incomplete", domain)
		return nil, fmt.Errorf("domain not found or not registered")
	}

	log.Printf("[INFO] Successfully parsed WHOIS data for %s (Registrar: %s)", domain, result.Registrar.Name)
	return &types.WhoisInfo{
		CreatedDate:    helpers.StringPtr(result.Domain.CreatedDate),
		UpdatedDate:    helpers.StringPtr(result.Domain.UpdatedDate),
		ExpirationDate: helpers.StringPtr(result.Domain.ExpirationDate),
		Registrar:      helpers.StringPtr(result.Registrar.Name),
	}, nil
}
