package shared

import "uuid"

type Form struct {
	Id          uuid.UUID  `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Questions   []Question `json:"questions"`
}

type FormOverview struct {
	Id          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Questions   int       `json:"questions"`
	Responses   int       `json:"responses"`
}

type FormEditors struct {
	FormID  uuid.UUID
	OwnerID uuid.UUID
}

func (e FormEditors) CanEditForm(userID uuid.UUID) bool {
	return e.OwnerID == userID
}
