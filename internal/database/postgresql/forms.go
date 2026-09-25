package postgresql

import (
	"encoding/json"
	"errors"
	"gallfeder-forms/internal/database/general"
	"gallfeder-forms/internal/internal_errors"
	"gallfeder-forms/internal/shared"
	"strings"
	"time"
	"uuid"

	log "github.com/sirupsen/logrus"
)

func (db PostgreSQL) CreateFormWithDescription(userID uuid.UUID, id uuid.UUID, title string, description string) error {
	if strings.TrimSpace(description) == "" {
		return db.CreateForm(userID, id, title)
	}
	if strings.TrimSpace(title) == "" {
		return internal_errors.ErrDBParameterIssue
	}

	conn := db.getConnection()
	_, err := conn.Exec(`
	INSERT INTO forms (owner_id, id, title, description) VALUES ($1, $2, $3, $4);
	`, userID.String(), id.String(), title, description)

	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value violates unique constraint") {
			return internal_errors.ErrDBDuplicatePresent
		}
		log.Errorf(`Ran into issue while creating form without description: %s\n`, err)
		return internal_errors.ErrDBGeneralIssue
	}
	return nil
}

func (db PostgreSQL) CreateForm(userID uuid.UUID, id uuid.UUID, title string) error {
	if strings.TrimSpace(title) == "" {
		return internal_errors.ErrDBParameterIssue
	}
	conn := db.getConnection()
	_, err := conn.Exec(`
	INSERT INTO forms (owner_id, id, title) VALUES ($1, $2, $3);
	`, userID.String(), id.String(), title)

	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value violates unique constraint") {
			return internal_errors.ErrDBDuplicatePresent
		}
		log.Errorf(`Ran into issue while creating form without description: %s\n`, err)
		return internal_errors.ErrDBGeneralIssue
	}
	return nil
}

func (db PostgreSQL) GetForm(id uuid.UUID) (shared.Form, error) {
	if id.String() == "" {
		return shared.Form{}, internal_errors.ErrDBParameterIssue
	}

	conn := db.getConnection()
	row := conn.QueryRow(`SELECT title, COALESCE(description, '') FROM forms WHERE id=$1;`, id.String())
	var form = shared.Form{
		Id: id,
	}

	err := row.Scan(&form.Title, &form.Description)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return shared.Form{}, internal_errors.ErrDBValueNotFound
		}
		log.Errorf(`Ran into issue while getting form: %s\n`, err)
		return shared.Form{}, internal_errors.ErrDBGeneralIssue
	}

	rows, err := conn.Query(`SELECT id, index, type, meta FROM questions WHERE form_id=$1;`, id.String())

	if err != nil {
		if err.Error() != "sql: no rows in result set" {
			log.Errorf(`Ran into issue while getting questions of form: %s\n`, err)
			return shared.Form{}, internal_errors.ErrDBGeneralIssue
		}
		form.Questions = nil
		return form, nil
	}

	for rows.Next() {
		var q shared.Question
		var qid, qmeta string
		err = rows.Scan(&qid, &q.Index, &q.Type, &qmeta)
		if err != nil {
			log.Errorf(`Ran into issue while scanning questions of form: %s\n`, err)
			_ = rows.Close()
			return shared.Form{}, internal_errors.ErrDBGeneralIssue
		}

		q.FormID = id
		q.QuestionID, err = uuid.Parse(qid)
		if err != nil {
			log.Errorf(`Encountered invalid question id in database while trying to parse just this: %s\n`, err)
			_ = rows.Close()
			return shared.Form{}, internal_errors.ErrDBGeneralIssue
		}

		decoded, err := shared.DecodeBase64(qmeta)
		if err != nil {
			log.Errorf(`Encountered invalidly encoded question metadata in database while trying to decode just this: %s\n`, err)
			_ = rows.Close()
			return shared.Form{}, internal_errors.ErrDBGeneralIssue
		}
		err = json.Unmarshal([]byte(decoded), &q.Meta)
		if err != nil {
			log.Errorf(`Encountered invalidly marshaled question metadata in database while trying to unmarshal just this: %s\n`, err)
			_ = rows.Close()
			return shared.Form{}, internal_errors.ErrDBGeneralIssue
		}

		form.Questions = append(form.Questions, q)
	}

	_ = rows.Close()
	return form, nil
}

func (db PostgreSQL) StartFormEditSession(formID uuid.UUID) (general.FormEditSession, error) {
	conn := db.getConnection()
	tx, err := conn.Begin()
	if err != nil {
		log.Errorf("Ran into issue while initiating tx for editing a form: %s\n", err)
		return PostgresFormEditSession{}, internal_errors.ErrDBGeneralIssue
	}

	session := PostgresFormEditSession{
		tx:     tx,
		formID: formID,
	}

	time.AfterFunc(time.Second*5, func() {
		err := session.AbortSession()
		if err != nil {
			if errors.Is(err, internal_errors.ErrDBSessionClosed) {
				return
			}
			log.Errorf("Encountered unexpected error while automatically to close FormEditSession: %s\n", err)
			return
		}
		log.Warn("Automatically closed unclosed FormEditSession after 5 seconds. As this is a failsafe timeout, there probably is an issue present with how the session is handled. If this is not a development environment, please report it immediately!")
	})

	return session, nil
}
