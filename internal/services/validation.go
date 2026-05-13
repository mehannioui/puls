package services

import (
	"errors"
	"fmt"
	"net/url"
)

var (
	ErrInvalidURL    = errors.New("url must use http or https scheme")
	ErrInvalidStatus = errors.New("expected_status must be between 100 and 599")
	ErrInvalidMethod = errors.New("method must be GET, HEAD, or POST")
	ErrIntervalTooLow = errors.New("interval_seconds below plan minimum")
	ErrPlanLimit     = errors.New("service limit reached for plan")
)

var validMethods = map[string]bool{"GET": true, "HEAD": true, "POST": true}

func validateURL(raw string) error {
	u, err := url.Parse(raw)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
		return fmt.Errorf("%w: %q", ErrInvalidURL, raw)
	}
	return nil
}

func validateStatus(code int32) error {
	if code < 100 || code > 599 {
		return ErrInvalidStatus
	}
	return nil
}

func validateMethod(method string) error {
	if !validMethods[method] {
		return ErrInvalidMethod
	}
	return nil
}

func validateInterval(interval, minInterval int32) error {
	if interval < minInterval {
		return fmt.Errorf("%w: minimum is %d seconds", ErrIntervalTooLow, minInterval)
	}
	return nil
}
