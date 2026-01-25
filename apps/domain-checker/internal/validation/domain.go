package validation

import (
	"fmt"
	"net"
	"net/url"
	"regexp"
	"strings"
)

var (
	domainRegex = regexp.MustCompile(`^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$`)
)

func ValidateAndExtractDomain(inputURL string) (string, error) {
	if inputURL == "" {
		return "", fmt.Errorf("URL cannot be empty")
	}

	if len(inputURL) > 2048 {
		return "", fmt.Errorf("URL exceeds maximum length of 2048 characters")
	}

	u, err := url.Parse(inputURL)
	if err != nil {
		return "", fmt.Errorf("invalid URL format: %w", err)
	}

	host := u.Host
	if host == "" {
		host = inputURL
	}

	if strings.Contains(host, ":") {
		host, _, err = net.SplitHostPort(host)
		if err != nil {
			host = strings.Split(host, ":")[0]
		}
	}

	domain := strings.TrimPrefix(strings.ToLower(host), "www.")

	if !domainRegex.MatchString(domain) {
		return "", fmt.Errorf("invalid domain format: %s", domain)
	}

	ips, err := net.LookupIP(domain)
	if err != nil {
		return domain, nil
	}

	for _, ip := range ips {
		if isPrivateIP(ip) {
			return "", fmt.Errorf("domain resolves to private IP address, request blocked for security")
		}
	}

	return domain, nil
}

func isPrivateIP(ip net.IP) bool {
	if ip.IsLoopback() {
		return true
	}

	if ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true
	}

	privateIPv4Blocks := []string{
		"10.0.0.0/8",
		"172.16.0.0/12",
		"192.168.0.0/16",
		"169.254.0.0/16",
		"127.0.0.0/8",
	}

	for _, cidr := range privateIPv4Blocks {
		_, block, _ := net.ParseCIDR(cidr)
		if block.Contains(ip) {
			return true
		}
	}

	if ip.To4() == nil {
		privateIPv6Blocks := []string{
			"::1/128",
			"fc00::/7",
			"fe80::/10",
			"ff00::/8",
		}

		for _, cidr := range privateIPv6Blocks {
			_, block, _ := net.ParseCIDR(cidr)
			if block.Contains(ip) {
				return true
			}
		}
	}

	return false
}
