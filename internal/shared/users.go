package shared

import "uuid"

type RequestIssuerInformation struct {
	VerifiedUser bool
	ID           uuid.UUID
	Handle       string
	UsedToken    string
}
