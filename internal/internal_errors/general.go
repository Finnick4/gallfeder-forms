package internal_errors

import "errors"

var (
	ErrPWInvalid       = errors.New("the password does not meet the standards")
	ErrUnexpectedIssue = errors.New("an unexpected issue arose")
)
