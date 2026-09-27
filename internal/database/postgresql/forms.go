package postgresql

import (
	"encoding/json"
	"errors"
	"gallfeder-forms/internal/database/db_general"
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
		return db_general.ErrDBParameterIssue
	}

	conn := db.getConnection()
	_, err := conn.Exec(`
	INSERT INTO forms (owner_id, id, title, description) VALUES ($1, $2, $3, $4);
	`, userID.String(), id.String(), title, description)

	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value violates unique constraint") {
			return db_general.ErrDBDuplicatePresent
		}
		log.Errorf(`Ran into issue while creating form without description: %s\n`, err)
		return db_general.ErrDBGeneralIssue
	}
	return nil
}

func (db PostgreSQL) CreateForm(userID uuid.UUID, id uuid.UUID, title string) error {
	if strings.TrimSpace(title) == "" {
		return db_general.ErrDBParameterIssue
	}
	conn := db.getConnection()
	_, err := conn.Exec(`
	INSERT INTO forms (owner_id, id, title) VALUES ($1, $2, $3);
	`, userID.String(), id.String(), title)

	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value violates unique constraint") {
			return db_general.ErrDBDuplicatePresent
		}
		log.Errorf(`Ran into issue while creating form without description: %s\n`, err)
		return db_general.ErrDBGeneralIssue
	}
	return nil
}

func (db PostgreSQL) GetForm(id uuid.UUID) (shared.Form, error) {
	if id.String() == "" {
		return shared.Form{}, db_general.ErrDBParameterIssue
	}

	conn := db.getConnection()
	row := conn.QueryRow(`SELECT title, COALESCE(description, '') FROM forms WHERE id=$1;`, id.String())
	var form = shared.Form{
		Id: id,
	}

	err := row.Scan(&form.Title, &form.Description)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return shared.Form{}, db_general.ErrDBValueNotFound
		}
		log.Errorf(`Ran into issue while getting form: %s\n`, err)
		return shared.Form{}, db_general.ErrDBGeneralIssue
	}

	rows, err := conn.Query(`SELECT id, index, type, meta FROM questions WHERE form_id=$1;`, id.String())

	if err != nil {
		if err.Error() != "sql: no rows in result set" {
			log.Errorf(`Ran into issue while getting questions of form: %s\n`, err)
			return shared.Form{}, db_general.ErrDBGeneralIssue
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
			return shared.Form{}, db_general.ErrDBGeneralIssue
		}

		q.FormID = id
		q.QuestionID, err = uuid.Parse(qid)
		if err != nil {
			log.Errorf(`Encountered invalid question id in database while trying to parse just this: %s\n`, err)
			_ = rows.Close()
			return shared.Form{}, db_general.ErrDBGeneralIssue
		}

		decoded, err := shared.DecodeBase64(qmeta)
		if err != nil {
			log.Errorf(`Encountered invalidly encoded question metadata in database while trying to decode just this: %s\n`, err)
			_ = rows.Close()
			return shared.Form{}, db_general.ErrDBGeneralIssue
		}
		err = json.Unmarshal([]byte(decoded), &q.Meta)
		if err != nil {
			log.Errorf(`Encountered invalidly marshaled question metadata in database while trying to unmarshal just this: %s\n`, err)
			_ = rows.Close()
			return shared.Form{}, db_general.ErrDBGeneralIssue
		}

		form.Questions = append(form.Questions, q)
	}

	_ = rows.Close()
	return form, nil
}

func (db PostgreSQL) StartFormEditSession(formID uuid.UUID) (db_general.FormEditSession, error) {
	conn := db.getConnection()
	tx, err := conn.Begin()
	if err != nil {
		log.Errorf("Ran into issue while initiating tx for editing a form: %s\n", err)
		return PostgresFormEditSession{}, db_general.ErrDBGeneralIssue
	}

	session := PostgresFormEditSession{
		tx:     tx,
		formID: formID,
	}

	time.AfterFunc(time.Second*5, func() {
		err := session.AbortSession()
		if err != nil {
			if errors.Is(err, db_general.ErrDBSessionClosed) {
				return
			}
			log.Errorf("Encountered unexpected error while automatically to close FormEditSession: %s\n", err)
			return
		}
		log.Warn("Automatically closed unclosed FormEditSession after 5 seconds. As this is a failsafe timeout, there probably is an issue present with how the session is handled. If this is not a development environment, please report it immediately!")
	})

	return session, nil
}

func (db PostgreSQL) GetFormEditors(id uuid.UUID) (shared.FormEditors, error) {
	conn := db.getConnection()

	resp := conn.QueryRow(`SELECT owner_id FROM forms WHERE id = $1;`, id.String())

	var ownerUUIDStr string

	err := resp.Scan(&ownerUUIDStr)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return shared.FormEditors{}, db_general.ErrDBValueNotFound
		}
		log.Errorf("Encountered unexpected issue while owner of specific form to get form editors: %s\n", err)
		return shared.FormEditors{}, db_general.ErrDBUnexpectedIssue
	}

	ownerID, err := uuid.Parse(ownerUUIDStr)
	if err != nil {
		log.Errorf("Failed to parse owner UUID from database response for getting form editors: %s\n", err)
		return shared.FormEditors{}, db_general.ErrDBUnexpectedIssue
	}

	return shared.FormEditors{
		FormID:  id,
		OwnerID: ownerID,
	}, nil
}
