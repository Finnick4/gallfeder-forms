package shared

import "errors"

var (
	ErrPWInvalid       = errors.New("the password does not meet the standards")
	ErrUnexpectedIssue = errors.New("encountered unexpected issue")
)
