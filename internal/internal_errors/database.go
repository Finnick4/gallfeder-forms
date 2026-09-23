package internal_errors

import "errors"

var (
	ErrDBGeneralIssue     = errors.New("database issue")
	ErrDBUnexpectedIssue  = errors.New("unexpected database issue occurred")
	ErrDBDuplicatePresent = errors.New("one of the provided values was considered a duplicate by a row with unique key")
	ErrDBValueNotFound    = errors.New("the queried piece of data does not exist")
	ErrDBNoProvider       = errors.New("the database provider was not set")
	ErrDBParameterIssue   = errors.New("one of the parameters contained an issue")
	ErrDBSessionClosed    = errors.New("the given session is already closed")
)
