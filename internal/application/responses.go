package application

import (
	"errors"
	"gallfeder-forms/internal/database/db_general"
	"gallfeder-forms/internal/shared"
	"sync"
	"uuid"

	log "github.com/sirupsen/logrus"
)

func CreateResponse(formID uuid.UUID, answers []shared.QuestionAnswer) (string, error) {
	if !IsDBSet() {
		log.Error("Aborted creation of new form as no database is set!")
		return "", ErrNoDBProvider
	}

	// @TODO check whether the answers to the questions are formally correct

	id := uuid.NewV4()

	err := db.CreateResponse(id, formID, answers)
	if err != nil {
		if errors.Is(err, db_general.ErrDBDuplicatePresent) {
			log.Error("UUID for new response was a duplicate!")
			return "", err
		}
		if errors.Is(err, db_general.ErrDBParameterIssue) {
			return "", err
		}
		log.Errorf("Failed to create response for form: %s\n", err)
		return "", err
	}

	return id.String(), nil
}

func GetResponsesToForm(formID uuid.UUID) (shared.FormResponses, error) {
	if !IsDBSet() {
		log.Error("Aborted creation of new form as no database is set!")
		return shared.FormResponses{}, ErrNoDBProvider
	}

	responses, err := db.GetFormResponses(formID)
	if err != nil {
		if errors.Is(err, db_general.ErrDBValueNotFound) {
			return shared.FormResponses{}, ErrDoesNotExist
		}
		log.Errorf("Encountered issue while getting responses to a form: %s", err)
		return shared.FormResponses{}, ErrUnexpectedIssue
	}

	wg := sync.WaitGroup{}
	for i, q := range responses.QuestionResponses {
		if q.Type == shared.QuestionTypeString {
			wg.Go(func() {
				responses.QuestionResponses[i].Meta.SubmittedTextsAnalysis = shared.AnalyseStrings(q.Meta.SubmittedTexts).Polish(20)
				responses.QuestionResponses[i].Meta.SubmittedTexts = []string{}
			})
		}
	}
	wg.Wait()

	return responses, nil
}
