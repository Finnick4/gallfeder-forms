package general

import (
	"gallfeder-forms/internal/shared"
	"uuid"
)

type Database interface {
	CreateFormWithDescription(id uuid.UUID, title string, description string) error
	CreateForm(id uuid.UUID, title string) error
	GetForm(id uuid.UUID) (shared.Form, error)
	// @TODO add close
	// @TODO add ping
}
