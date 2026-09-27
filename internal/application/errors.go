package application

import "errors"

var (
	ErrUnexpectedIssue   = errors.New("an unexpected issue arose")
	ErrInvalidParameters = errors.New("one of the provided parameter is invalid")
	ErrDoesNotExist      = errors.New("did not find the requested resource")
	ErrNoDBProvider      = errors.New("the database provider was not set")
)
