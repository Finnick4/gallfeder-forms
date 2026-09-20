package application

import (
	"errors"
	"gallfeder-forms/internal/internal_errors"
	"gallfeder-forms/internal/shared"
	"uuid"

	log "github.com/sirupsen/logrus"
)

func CreateResponse(formID uuid.UUID, answers []shared.QuestionAnswer) (string, error) {
	if !IsDBSet() {
		log.Error("Aborted creation of new form as no database is set!")
		return "", internal_errors.ErrDBNoProvider
	}

	// @TODO check whether the answers to the questions are formally correct

	id := uuid.NewV4()

	err := db.CreateResponse(id, formID, answers)
	if err != nil {
		if errors.Is(err, internal_errors.ErrDBDuplicatePresent) {
			log.Error("UUID for new response was a duplicate!")
			return "", err
		}
		if errors.Is(err, internal_errors.ErrDBParameterIssue) {
			return "", err
		}
		log.Errorf("Failed to create response for form: %s\n", err)
		return "", err
	}

	return id.String(), nil
}
