package types

import "time"

type WhoisInfo struct {
	CreatedDate    *string `json:"created_date,omitempty"`
	UpdatedDate    *string `json:"updated_date,omitempty"`
	ExpirationDate *string `json:"expiration_date,omitempty"`
	Registrar      *string `json:"registrar,omitempty"`
}

type SSLInfo struct {
	Issuer       *string    `json:"issuer,omitempty"`
	Expiry       *time.Time `json:"expiry,omitempty"`
	IsSelfSigned *bool      `json:"is_self_signed,omitempty"`
}

type CheckResult struct {
	Data  any     `json:"data,omitempty"`
	Error *string `json:"error,omitempty"`
}

type CheckAllResponse struct {
	Domain string      `json:"domain"`
	Whois  CheckResult `json:"whois"`
	SSL    CheckResult `json:"ssl"`
}
