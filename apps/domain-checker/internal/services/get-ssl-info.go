package services

import (
	"crypto/tls"
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

	conf := &tls.Config{
		InsecureSkipVerify: false, // do not allow expired/invalid certs
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
