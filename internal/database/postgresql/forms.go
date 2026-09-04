package postgresql

import (
	"gallfeder-forms/internal/internal_errors"
	"gallfeder-forms/internal/shared"
	"strings"
	"uuid"

	log "github.com/sirupsen/logrus"
)

func (db PostgreSQL) CreateFormWithDescription(id uuid.UUID, title string, description string) error {
	if strings.TrimSpace(description) == "" {
		return db.CreateForm(id, title)
	}
	if strings.TrimSpace(title) == "" {
		return internal_errors.ErrParameterIssue
	}

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
	if strings.TrimSpace(title) == "" {
		return internal_errors.ErrParameterIssue
	}
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

func (db PostgreSQL) GetForm(id uuid.UUID) (shared.Form, error) {
	if id.String() == "" {
		return shared.Form{}, internal_errors.ErrParameterIssue
	}

	conn := db.getConnection()
	row := conn.QueryRow(`SELECT form_title, COALESCE(form_description, '') FROM forms WHERE form_id=$1;`, id.String())
	var form = shared.Form{
		Id: id.String(),
	}

	err := row.Scan(&form.Title, &form.Description)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return shared.Form{}, internal_errors.ErrNotFound
		}
		log.Errorf(`Ran into issue while getting form: %s\n`, err)
		return shared.Form{}, internal_errors.ErrGeneralIssue
	}

	return form, nil
}
