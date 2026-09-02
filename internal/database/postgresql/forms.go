package postgresql

import (
	"gallfeder-forms/internal/internal_errors"
	"strings"
	"uuid"

	log "github.com/sirupsen/logrus"
)

func (db PostgreSQL) CreateFormWithDescription(id uuid.UUID, title string, description string) error {
	conn := db.getConnection()
	_, err := conn.Exec(`
	INSERT INTO forms (form_id, form_title, form_description) VALUES ($1, $2, $3);
	`, id.String(), title, description)

	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value violates unique constraint") {
			return internal_errors.ErrDuplicatePresent
		}
		log.Errorf(`Ran into issue while creating form without description: %s\n`, err)
		return internal_errors.ErrGeneralIssue
	}
	return nil
}

func (db PostgreSQL) CreateForm(id uuid.UUID, title string) error {
	conn := db.getConnection()
	_, err := conn.Exec(`
	INSERT INTO forms (form_id, form_title) VALUES ($1, $2);
	`, id.String(), title)

	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value violates unique constraint") {
			return internal_errors.ErrDuplicatePresent
		}
		log.Errorf(`Ran into issue while creating form without description: %s\n`, err)
		return internal_errors.ErrGeneralIssue
	}
	return nil
}
