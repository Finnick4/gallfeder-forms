package internal_errors

import "errors"

var (
	ErrPWInvalid         = errors.New("the password does not meet the standards")
	ErrUnexpectedIssue   = errors.New("an unexpected issue arose")
	ErrInvalidParameters = errors.New("one of the provided parameter is invalid")
)
