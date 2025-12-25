package services

import (
	"crypto/tls"
	"crypto/x509"
	"domain-checker/internal/helpers"
	"fmt"
	"log"
	"net"
	"time"
)

type SSLInfo struct {
	Issuer       *string    `json:"issuer,omitempty"`
	Expiry       *time.Time `json:"expiry,omitempty"`
	IsSelfSigned *bool      `json:"is_self_signed,omitempty"`
}

func GetSSLInfo(domain string) (*SSLInfo, error) {
	log.Printf("[INFO] Checking SSL certificate for domain: %s", domain)

	// Load system certificate pool for proper certificate verification
	rootCAs, err := x509.SystemCertPool()
	if err != nil {
		log.Printf("[WARN] Failed to load system cert pool: %v, using default", err)
		rootCAs = nil // nil means use default/embedded certificates
	}

	conf := &tls.Config{
		InsecureSkipVerify: false, // do not allow expired/invalid certs
		RootCAs:            rootCAs,
	}

	dialer := &net.Dialer{Timeout: 5 * time.Second}
	conn, err := tls.DialWithDialer(dialer, "tcp", domain+":443", conf)

	if err != nil {
		log.Printf("[ERROR] SSL connection failed for %s:443: %v", domain, err)
		return nil, err
	}

	defer conn.Close()

	certs := conn.ConnectionState().PeerCertificates
	if len(certs) == 0 {
		log.Printf("[ERROR] No certificates found for %s", domain)
		return nil, fmt.Errorf("no certificates found")
	}

	leaf := certs[0]
	isSelfSigned := leaf.Issuer.CommonName == leaf.Subject.CommonName

	log.Printf("[INFO] SSL check successful for %s (Issuer: %s, Expiry: %s, Self-signed: %v)",
		domain, leaf.Issuer.CommonName, leaf.NotAfter.Format(time.RFC3339), isSelfSigned)

	return &SSLInfo{
		Issuer:       helpers.StringPtr(leaf.Issuer.CommonName),
		Expiry:       &leaf.NotAfter,
		IsSelfSigned: &isSelfSigned,
	}, nil
}
