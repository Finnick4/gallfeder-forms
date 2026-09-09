package internal_errors

import "errors"

var (
	ErrGeneralIssue       = errors.New("database issue")
	ErrDuplicatePresent   = errors.New("one of the provided values was considered a duplicate by a row with unique key")
	ErrNotFound           = errors.New("the queried piece of data does not exist")
	ErrNoDatabaseProvider = errors.New("the database provider was not set")
	ErrParameterIssue     = errors.New("one of the parameters contained an issue")
	ErrSessionClosed      = errors.New("the given session is already closed")
)
