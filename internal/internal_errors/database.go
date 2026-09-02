package internal_errors

import "errors"

var (
	ErrGeneralIssue     = errors.New("database issue")
	ErrDuplicatePresent = errors.New("one of the provided values was considered a duplicate by a row with unique key")
)
