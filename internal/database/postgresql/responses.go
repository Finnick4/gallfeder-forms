package postgresql

import (
	"encoding/json"
	"fmt"
	"gallfeder-forms/internal/internal_errors"
	"gallfeder-forms/internal/shared"
	"strconv"
	"strings"
	"uuid"

	log "github.com/sirupsen/logrus"
)

func (db PostgreSQL) CreateResponse(responseID uuid.UUID, formID uuid.UUID, answers []shared.QuestionAnswer) error {
	conn := db.getConnection()
	tx, err := conn.Begin()
	if err != nil {
		log.Errorf("Ran into issue while initiating tx for creating response: %s\n", err)
		return internal_errors.ErrGeneralIssue
	}
	defer tx.Rollback()

	_, err = tx.Exec(`INSERT INTO responses (id, form_id) VALUES ($1, $2);`, responseID.String(), formID.String())
	if err != nil {
		_ = tx.Rollback()
		if err.Error() == "sql: no rows in result set" {
			log.Warn()
			return internal_errors.ErrDuplicatePresent
		}
		log.Errorf(`Ran into issue while getting questions of form: %s\n`, err)
		return internal_errors.ErrGeneralIssue
	}

	fields := 3
	values := make([]any, 0, len(answers)*fields)
	for _, answer := range answers {
		text, err := json.Marshal(answer.Meta)
		if err != nil {
			log.Errorf("Failed to marshal metadata of an answer to question of a response for CreateResponse: %s\n", err)
			_ = tx.Rollback()
			return internal_errors.ErrParameterIssue
		}
		meta := shared.EncodeBase64(string(text))

		values = append(values, responseID, answer.QuestionID, meta)
	}

	query := fmt.Sprintf(`INSERT INTO response_to_question (response_id, question_id, meta) VALUES %s;`, generateInsertValuesMatrix(fields, len(answers)))
	_, err = tx.Exec(query, values...)
	if err != nil {
		_ = tx.Rollback()
		if strings.HasPrefix(err.Error(), "pq: duplicate key value violates unique constraint") {
			return internal_errors.ErrDuplicatePresent
		}
		if strings.HasPrefix(err.Error(), "pq: insert or update on table \"response_to_question\" violates foreign key constraint") {
			return internal_errors.ErrParameterIssue
		}
		log.Errorf(`Ran into issue while getting questions of form: %s\n`, err)
		return internal_errors.ErrGeneralIssue
	}
	err = tx.Commit()
	if err != nil {
		log.Errorf("Ran into error while trying to commit CreateResponse: %s\n", err)
		return internal_errors.ErrGeneralIssue
	}

	return nil
}

func generateInsertValuesMatrix(fields int, values int) string {
	if fields <= 0 || values <= 0 {
		return ""
	}
	var s strings.Builder
	s.WriteString("(")
	for i := 0; i < fields*values; i++ {
		n := i + 1
		s.WriteString("$" + strconv.Itoa(n))

		if n%fields != 0 {
			s.WriteString(", ")
			continue
		}
		s.WriteString(")")
		if n != fields*values {
			s.WriteString(", (")
		}
	}

	return s.String()
}
