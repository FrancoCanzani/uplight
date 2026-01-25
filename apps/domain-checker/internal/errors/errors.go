package errors

import "fmt"

type ErrorType string

const (
	ErrorTypeValidation  ErrorType = "validation_error"
	ErrorTypeNotFound    ErrorType = "not_found"
	ErrorTypeNetwork     ErrorType = "network_error"
	ErrorTypeTimeout     ErrorType = "timeout_error"
	ErrorTypeCertificate ErrorType = "certificate_error"
	ErrorTypeRateLimit   ErrorType = "rate_limit_error"
	ErrorTypeInternal    ErrorType = "internal_error"
	ErrorTypeSecurity    ErrorType = "security_error"
)

type DomainError struct {
	Type    ErrorType
	Message string
	Err     error
}

func (e *DomainError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s - %v", e.Type, e.Message, e.Err)
	}
	return fmt.Sprintf("%s: %s", e.Type, e.Message)
}

func (e *DomainError) Unwrap() error {
	return e.Err
}

func New(errType ErrorType, message string, err error) *DomainError {
	return &DomainError{
		Type:    errType,
		Message: message,
		Err:     err,
	}
}

func NewValidationError(message string) *DomainError {
	return &DomainError{
		Type:    ErrorTypeValidation,
		Message: message,
	}
}

func NewSecurityError(message string) *DomainError {
	return &DomainError{
		Type:    ErrorTypeSecurity,
		Message: message,
	}
}

func NewNotFoundError(message string) *DomainError {
	return &DomainError{
		Type:    ErrorTypeNotFound,
		Message: message,
	}
}

func NewNetworkError(message string, err error) *DomainError {
	return &DomainError{
		Type:    ErrorTypeNetwork,
		Message: message,
		Err:     err,
	}
}

func NewTimeoutError(message string) *DomainError {
	return &DomainError{
		Type:    ErrorTypeTimeout,
		Message: message,
	}
}

func NewCertificateError(message string, err error) *DomainError {
	return &DomainError{
		Type:    ErrorTypeCertificate,
		Message: message,
		Err:     err,
	}
}
