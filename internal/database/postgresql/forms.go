package postgresql

import (
	"errors"
	"gallfeder-forms/internal/database/general"
	"gallfeder-forms/internal/internal_errors"
	"gallfeder-forms/internal/shared"
	"strings"
	"time"
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
	INSERT INTO forms (id, title, description) VALUES ($1, $2, $3);
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
	INSERT INTO forms (id, title) VALUES ($1, $2);
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
	row := conn.QueryRow(`SELECT title, COALESCE(description, '') FROM forms WHERE id=$1;`, id.String())
	var form = shared.Form{
		Id: id,
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

func (db PostgreSQL) StartFormEditSession(formID uuid.UUID) (general.FormEditSession, error) {
	conn := db.getConnection()
	tx, err := conn.Begin()
	if err != nil {
		log.Errorf("Ran into issue while initiating tx for editing a form: %s\n", err)
		return PostgresFormEditSession{}, err
	}

	session := PostgresFormEditSession{
		tx:     tx,
		formID: formID,
	}

	time.AfterFunc(time.Second*5, func() {
		err := session.AbortSession()
		if err != nil {
			if errors.Is(err, internal_errors.ErrSessionClosed) {
				return
			}
			log.Errorf("Encountered unexpected error while automatically to close FormEditSession: %s\n", err)
			return
		}
		log.Warn("Automatically closed unclosed FormEditSession after 5 seconds. As this is a failsafe timeout, there probably is an issue present with how the session is handled. If this is not a development environment, please report it immediately!")
	})

	return session, nil
}
