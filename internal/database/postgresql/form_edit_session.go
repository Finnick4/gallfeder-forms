package postgresql

import (
	"database/sql"
	"encoding/json"
	"errors"
	"gallfeder-forms/internal/internal_errors"
	"gallfeder-forms/internal/shared"
	"uuid"

	log "github.com/sirupsen/logrus"
)

type PostgresFormEditSession struct {
	tx     *sql.Tx
	ended  bool
	formID uuid.UUID
}

func (p PostgresFormEditSession) EditTitle(title string) {
	if p.ended {
		return
	}
	_, err := p.tx.Exec(`UPDATE forms SET title=$1 WHERE id=$2;`, title, p.formID.String())
	if err != nil {
		log.Errorf("Failed to stage EditTitle within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
}

func (p PostgresFormEditSession) EditDescription(description string) {
	if p.ended {
		return
	}
	_, err := p.tx.Exec(`UPDATE forms SET description=$1 WHERE id=$2;`, description, p.formID.String())
	if err != nil {
		log.Errorf("Failed to stage EditDescription within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
}

func (p PostgresFormEditSession) EditTitleAndDescription(title string, description string) {
	if p.ended {
		return
	}
	_, err := p.tx.Exec(`UPDATE forms SET title=$1, description=$2 WHERE id=$3;`, title, description, p.formID.String())
	if err != nil {
		log.Errorf("Failed to stage EditTitleAndDescription within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
}

func (p PostgresFormEditSession) RemoveDescription() {
	if p.ended {
		return
	}
	_, err := p.tx.Exec(`UPDATE forms SET description=NULL WHERE id=$1;`, p.formID.String())
	if err != nil {
		log.Errorf("Failed to stage RemoveDescription within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
}

func (p PostgresFormEditSession) CreateQuestion(questionID uuid.UUID, questionType shared.QuestionType, meta shared.QuestionMetaData) {
	if p.ended {
		return
	}
	text, err := json.Marshal(meta)
	if err != nil {
		log.Errorf("Failed to marshal question metadata for CreateQuestion within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
	encoded := shared.EncodeBase64(string(text))

	_, err = p.tx.Exec(`INSERT INTO questions (id, form_id, index, type, meta) VALUES ($1, $2, 0, $3, $4);`, questionID.String(), p.formID.String(), questionType, encoded)
	if err != nil {
		log.Errorf("Failed to stage CreateQuestion within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
}

func (p PostgresFormEditSession) UpdateQuestionMetadata(questionID uuid.UUID, meta shared.QuestionMetaData) {
	if p.ended {
		return
	}
	text, err := json.Marshal(meta)
	if err != nil {
		log.Errorf("Failed to marshal question metadata for UpdateQuestionMetadata within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
	encoded := shared.EncodeBase64(string(text))

	_, err = p.tx.Exec(`UPDATE questions SET meta=$1 WHERE id=$2;`, encoded, questionID.String())
	if err != nil {
		log.Errorf("Failed to stage UpdateQuestionMetadata within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
}

func (p PostgresFormEditSession) UpdateQuestionType(questionID uuid.UUID, questionType shared.QuestionType) {
	if p.ended {
		return
	}
	_, err := p.tx.Exec(`UPDATE questions SET type=$1 WHERE id=$2;`, questionType, questionID.String())
	if err != nil {
		log.Errorf("Failed to stage UpdateQuestionType within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
}

func (p PostgresFormEditSession) UpdateQuestionTypeAndMetadata(questionID uuid.UUID, questionType shared.QuestionType, meta shared.QuestionMetaData) {
	if p.ended {
		return
	}
	text, err := json.Marshal(meta)
	if err != nil {
		log.Errorf("Failed to marshal question metadata for UpdateQuestionTypeAndMetadata within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
	encoded := shared.EncodeBase64(string(text))

	_, err = p.tx.Exec(`UPDATE questions SET type=$1, meta=$2 WHERE id=$3;`, questionType, encoded, questionID.String())
	if err != nil {
		log.Errorf("Failed to stage UpdateQuestionTypeAndMetadata within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
}

func (p PostgresFormEditSession) DeleteQuestion(questionID uuid.UUID) {
	if p.ended {
		return
	}
	_, err := p.tx.Exec(`DELETE FROM questions WHERE id=$1;`, questionID.String())
	if err != nil {
		log.Errorf("Failed to stage DeleteQuestion within forms edit session: %s\n", err)
		_ = p.AbortSession()
		return
	}
}

func (p PostgresFormEditSession) ExecuteSession() error {
	if p.ended {
		return internal_errors.ErrDBSessionClosed
	}

	err := p.tx.Commit()
	if err != nil {
		if errors.Is(err, sql.ErrTxDone) {
			return internal_errors.ErrDBSessionClosed
		}
		log.Errorf("Ran into error while trying to commit FormEditSession: %s\n", err)
		return internal_errors.ErrDBGeneralIssue
	}
	return nil
}

func (p PostgresFormEditSession) AbortSession() error {
	if p.ended {
		return internal_errors.ErrDBSessionClosed
	}
	p.ended = true

	err := p.tx.Rollback()
	if err != nil {
		if errors.Is(err, sql.ErrTxDone) {
			return internal_errors.ErrDBSessionClosed
		}
		log.Errorf("Ran into error while trying to commit FormEditSession: %s\n", err)
		return err
	}
	return nil
}
