package application

import (
	"errors"
	"gallfeder-forms/internal/internal_errors"
	"uuid"

	log "github.com/sirupsen/logrus"
)

func CreateForm(title string, description string) (string, error) {
	if !IsDBSet() {
		log.Error("Aborted creation of new form as no database is set!")
		return "", internal_errors.ErrNoDatabaseProvider
	}

	id := uuid.NewV4()
	// @TODO Check cache for possible duplicate id

	var err error
	if description == "" {
		err = db.CreateForm(id, title)
	} else {
		err = db.CreateFormWithDescription(id, title, description)
	}

	if err != nil {
		if errors.Is(err, internal_errors.ErrDuplicatePresent) {
			log.Error("UUID for new form was a duplicate!") // this *should* not happen
			return "", err
		}
		if errors.Is(err, internal_errors.ErrParameterIssue) {
			log.Debug("Form name was set to a whitespace!")
			return "", err
		}
	}

	return id.String(), nil
}
