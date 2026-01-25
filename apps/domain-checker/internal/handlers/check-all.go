package handlers

import (
	"domain-checker/internal/services"
	"domain-checker/internal/types"
	"domain-checker/internal/validation"
	"log"
	"sync"

	"github.com/gin-gonic/gin"
)

func CheckAllHandler(c *gin.Context) {
	inputURL := c.Query("url")

	if inputURL == "" {
		log.Printf("[ERROR] Missing url parameter from %s", c.ClientIP())
		c.JSON(400, gin.H{"error": "url parameter is required"})
		return
	}

	log.Printf("[INFO] Processing check request for URL: %s from %s", inputURL, c.ClientIP())

	domain, err := validation.ValidateAndExtractDomain(inputURL)
	if err != nil {
		log.Printf("[ERROR] Validation failed for %s: %v", inputURL, err)
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	log.Printf("[INFO] Validated domain: %s", domain)

	var wg sync.WaitGroup
	var whoisData *types.WhoisInfo
	var whoisErr error
	var sslData *types.SSLInfo
	var sslErr error

	wg.Add(2)

	go func() {
		defer wg.Done()
		whoisData, whoisErr = services.GetWhoisInfo(domain)
	}()

	go func() {
		defer wg.Done()
		sslData, sslErr = services.GetSSLInfo(domain)
	}()

	wg.Wait()

	whoisResult := types.CheckResult{}
	if whoisErr != nil {
		log.Printf("[WARN] WHOIS lookup failed for %s: %v", domain, whoisErr)
		errStr := whoisErr.Error()
		whoisResult.Error = &errStr
	} else {
		log.Printf("[INFO] WHOIS lookup successful for %s", domain)
		whoisResult.Data = whoisData
	}

	sslResult := types.CheckResult{}
	if sslErr != nil {
		log.Printf("[WARN] SSL check failed for %s: %v", domain, sslErr)
		errStr := sslErr.Error()
		sslResult.Error = &errStr
	} else {
		log.Printf("[INFO] SSL check successful for %s", domain)
		sslResult.Data = sslData
	}

	resp := types.CheckAllResponse{
		Domain: domain,
		Whois:  whoisResult,
		SSL:    sslResult,
	}

	log.Printf("[INFO] Completed check for domain: %s", domain)
	c.JSON(200, resp)
}
