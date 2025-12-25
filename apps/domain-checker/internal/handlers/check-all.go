package handlers

import (
	"domain-checker/internal/services"
	"log"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
)

type CheckResult struct {
	Data  any     `json:"data,omitempty"`
	Error *string `json:"error,omitempty"`
}

type WhoisData struct {
	CreatedDate    *string `json:"created_date,omitempty"`
	UpdatedDate    *string `json:"updated_date,omitempty"`
	ExpirationDate *string `json:"expiration_date,omitempty"`
	Registrar      *string `json:"registrar,omitempty"`
}

type SSLInfo struct {
	Issuer       string `json:"issuer,omitempty"`
	Expiry       string `json:"expiry,omitempty"`
	IsSelfSigned bool   `json:"is_self_signed,omitempty"`
}

type CheckAllResponse struct {
	Domain string      `json:"domain"`
	Whois  CheckResult `json:"whois"`
	SSL    CheckResult `json:"ssl"`
}

func CheckAllHandler(c *gin.Context) {
	inputURL := c.Query("url")

	if inputURL == "" {
		log.Printf("[ERROR] Missing url parameter from %s", c.ClientIP())
		c.JSON(400, gin.H{"error": "url parameter is required"})
		return
	}

	log.Printf("[INFO] Processing check request for URL: %s from %s", inputURL, c.ClientIP())

	u, err := url.Parse(inputURL)
	if err != nil {
		log.Printf("[ERROR] Invalid URL format: %s - %v", inputURL, err)
		c.JSON(400, gin.H{"error": "Invalid URL format"})
		return
	}

	host := u.Host
	if host == "" {
		host = inputURL
	}

	domain := strings.TrimPrefix(host, "www.")
	log.Printf("[INFO] Extracted domain: %s", domain)

	whoisData, whoisErr := services.GetWhoisInfo(domain)
	whoisResult := CheckResult{}

	if whoisErr != nil {
		log.Printf("[WARN] WHOIS lookup failed for %s: %v", domain, whoisErr)
		errStr := whoisErr.Error()
		whoisResult.Error = &errStr
	} else {
		log.Printf("[INFO] WHOIS lookup successful for %s", domain)
		whoisResult.Data = whoisData
	}

	sslData, sslErr := services.GetSSLInfo(domain)
	sslResult := CheckResult{}
	if sslErr != nil {
		log.Printf("[WARN] SSL check failed for %s: %v", domain, sslErr)
		errStr := sslErr.Error()
		sslResult.Error = &errStr
	} else {
		log.Printf("[INFO] SSL check successful for %s", domain)
		sslResult.Data = sslData
	}

	resp := CheckAllResponse{
		Domain: domain,
		Whois:  whoisResult,
		SSL:    sslResult,
	}

	log.Printf("[INFO] Completed check for domain: %s", domain)
	c.JSON(200, resp)
}
