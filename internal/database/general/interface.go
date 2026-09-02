package general

import "uuid"

type Database interface {
	CreateFormWithDescription(id uuid.UUID, title string, description string) error
	CreateForm(id uuid.UUID, title string) error
	// @TODO add close
}
