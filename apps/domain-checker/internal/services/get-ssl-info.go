package services

import (
	"crypto/tls"
	"crypto/x509"
	"domain-checker/internal/helpers"
	"domain-checker/internal/types"
	"fmt"
	"log"
	"net"
	"time"
)

func GetSSLInfo(domain string) (*types.SSLInfo, error) {
	log.Printf("[INFO] Checking SSL certificate for domain: %s", domain)

	rootCAs, err := x509.SystemCertPool()
	if err != nil {
		log.Printf("[WARN] Failed to load system cert pool: %v, using default", err)
		rootCAs = nil
	}

	conf := &tls.Config{
		InsecureSkipVerify: false,
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

	return &types.SSLInfo{
		Issuer:       helpers.StringPtr(leaf.Issuer.CommonName),
		Expiry:       &leaf.NotAfter,
		IsSelfSigned: &isSelfSigned,
	}, nil
}
