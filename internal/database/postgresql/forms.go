package postgresql

import (
	"encoding/json"
	"errors"
	"gallfeder-forms/internal/database/db_general"
	"gallfeder-forms/internal/shared"
	"strings"
	"sync"
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

func (db PostgreSQL) GetFormResponses(id uuid.UUID) (shared.FormResponses, error) {
	if id == uuid.Nil() {
		return shared.FormResponses{}, db_general.ErrDBParameterIssue
	}

	form, err := db.GetForm(id)
	if err != nil {
		return shared.FormResponses{}, err
	}

	mtx := sync.Mutex{}
	var escErr error
	var wg sync.WaitGroup
	responseForm := shared.FormResponses{
		Id:                id,
		Title:             form.Title,
		Description:       form.Description,
		QuestionResponses: make([]shared.QuestionResponses, len(form.Questions)),
	}
	wg.Add(len(form.Questions))
	for i, question := range form.Questions {
		go func() {
			switch question.Type {
			case shared.QuestionTypeChoice:
				qresp, err := db.getResponsesForChoiceQuestion(question)
				mtx.Lock()
				if err != nil {
					escErr = err
				}
				responseForm.QuestionResponses[i] = qresp
				mtx.Unlock()
				break
			case shared.QuestionTypeString:
				mtx.Lock()
				responseForm.QuestionResponses[i] = shared.QuestionResponses{
					QuestionID: question.QuestionID,
					FormID:     question.FormID,
					Index:      question.Index,
					Type:       question.Type,
					Meta:       shared.QuestionResponseMetaData{},
				}
				mtx.Unlock()
				log.Warn("String question types are not yet implemented!")
				break
			default:
				log.Warn("Found question with invalid type in database!")
			}
			wg.Done()
		}()
	}

	wg.Wait()
	if escErr != nil {
		return shared.FormResponses{}, db_general.ErrDBUnexpectedIssue
	}

	return responseForm, nil
}

func (db PostgreSQL) getResponsesForChoiceQuestion(q shared.Question) (shared.QuestionResponses, error) {
	if q.Type != shared.QuestionTypeChoice {
		return shared.QuestionResponses{}, db_general.ErrDBGeneralIssue
	}

	qresp := shared.QuestionResponses{
		QuestionID: q.QuestionID,
		FormID:     q.FormID,
		Index:      q.Index,
		Type:       q.Type,
		Meta: shared.QuestionResponseMetaData{
			Question:              q.Meta.Question,
			MaximumChoices:        q.Meta.MaximumChoices,
			ChosenOptions:         0,
			Responses:             0,
			ChoiceOptionsResponse: make([]shared.ChoiceQuestionOptionResponses, len(q.Meta.ChoiceOptions)),
		},
	}

	for i, option := range q.Meta.ChoiceOptions {
		qresp.Meta.ChoiceOptionsResponse[i] = shared.ChoiceQuestionOptionResponses{
			Text:        option.Text,
			TimesChosen: 0,
		}
	}

	conn := db.getConnection()
	rows, err := conn.Query(`SELECT meta FROM response_to_question WHERE question_id=$1`, q.QuestionID.String())
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return shared.QuestionResponses{}, db_general.ErrDBValueNotFound
		}
		log.Errorf("Unexpected issue while getting responses for a choice question: %s\n", err)
		return shared.QuestionResponses{}, db_general.ErrDBUnexpectedIssue
	}

	defer rows.Close()

	for rows.Next() {
		var meta string
		err = rows.Scan(&meta)
		if err != nil {
			log.Errorf("Unexpected issue while scanning for metadata of response for a choice question: %s\n", err)
			return shared.QuestionResponses{}, db_general.ErrDBUnexpectedIssue
		}

		decoded, err := shared.DecodeBase64(meta)
		if err != nil {
			log.Errorf(`Encountered invalidly encoded response metadata in database while trying to decode just this: %s\n`, err)
			_ = rows.Close()
			return shared.QuestionResponses{}, db_general.ErrDBGeneralIssue
		}
		var resp shared.QuestionAnswerMetadata
		err = json.Unmarshal([]byte(decoded), &resp)
		if err != nil {
			log.Errorf(`Encountered invalidly marshaled response metadata in database while trying to unmarshal just this: %s\n`, err)
			_ = rows.Close()
			return shared.QuestionResponses{}, db_general.ErrDBGeneralIssue
		}

		choices := 0
		for _, selchoice := range resp.SelectedChoices {
			for i, respOption := range qresp.Meta.ChoiceOptionsResponse {
				if respOption.Text == selchoice.Text {
					choices++
					qresp.Meta.ChoiceOptionsResponse[i].TimesChosen++
					break
				}
			}
		}
		qresp.Meta.ChosenOptions += choices
		if choices != 0 {
			qresp.Meta.Responses++
		}
	}

	return qresp, nil
}

func (db PostgreSQL) GetFormOverviewsOfOwner(userID uuid.UUID) ([]shared.FormOverview, error) {
	conn := db.getConnection()

	rows, err := conn.Query(`
SELECT forms.id, title, COALESCE(description, ''), COUNT(DISTINCT questions.id), COUNT(DISTINCT responses.id) 
FROM forms
	LEFT JOIN questions ON forms.id = questions.form_id
	LEFT JOIN responses ON forms.id = responses.form_id
WHERE owner_id=$1
GROUP BY forms.id, title, description, creation_date
ORDER BY creation_date DESC;`, userID.String())

	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return nil, db_general.ErrDBValueNotFound
		}
		log.Errorf(`Ran into issue while getting form overviews for user: %s\n`, err)
		return nil, db_general.ErrDBGeneralIssue
	}

	var formOverviews []shared.FormOverview

	for rows.Next() {
		var fo shared.FormOverview
		var fID string
		err = rows.Scan(&fID, &fo.Title, &fo.Description, &fo.Questions, &fo.Responses)
		if err != nil {
			log.Errorf(`Ran into issue while scanning form for form overview for specific user: %s\n`, err)
			_ = rows.Close()
			return nil, db_general.ErrDBGeneralIssue
		}

		fo.Id, err = uuid.Parse(fID)
		if err != nil {
			log.Errorf(`Encountered invalid form id in database while trying to parse just this: %s\n`, err)
			_ = rows.Close()
			return nil, db_general.ErrDBGeneralIssue
		}

		formOverviews = append(formOverviews, fo)
	}

	_ = rows.Close()
	return formOverviews, nil
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
