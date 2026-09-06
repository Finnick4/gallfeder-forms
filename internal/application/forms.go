package application

import (
	"errors"
	"gallfeder-forms/internal/internal_errors"
	"gallfeder-forms/internal/shared"
	"uuid"

	log "github.com/sirupsen/logrus"
)

func CreateForm(title string, description string) (string, error) {
	if !IsDBSet() {
		log.Error("Aborted creation of new form as no database is set!")
		return "", internal_errors.ErrNoDatabaseProvider
	}

	id := uuid.NewV4()

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

func GetForm(id uuid.UUID) (shared.Form, error) {
	if !IsDBSet() {
		log.Error("Aborted query of specific form as no database is set!")
		return shared.Form{}, internal_errors.ErrNoDatabaseProvider
	}

	// @TODO check in cache whether this ID actually exists

	form, err := db.GetForm(id)
	if err != nil {
		return shared.Form{}, err
	}

	return form, nil
}

func EditForm(form shared.Form, removeDescription bool, questions []shared.QuestionEdit) ([]shared.Question, error) {
	if !IsDBSet() {
		log.Error("Aborted editing form as no database is set!")
		return nil, internal_errors.ErrNoDatabaseProvider
	}
	s, err := db.StartFormEditSession(form.Id)
	if err != nil {
		log.Errorf("Encountered unexpected error while starting form edit session: %s\n", err)
		return nil, err
	}

	if form.Title != "" && form.Description != "" && !removeDescription {
		s.EditTitleAndDescription(form.Title, form.Description)
	}
	if form.Title != "" && (form.Description == "" || removeDescription) {
		s.EditTitle(form.Title)
	}
	if form.Title == "" && form.Description != "" && !removeDescription {
		s.EditDescription(form.Description)
	}
	if removeDescription {
		s.RemoveDescription()
	}

	var created []shared.Question
	for _, q := range questions {
		if q.QuestionID == uuid.Nil() {
			q.QuestionID = uuid.NewV4()
			s.CreateQuestion(q.QuestionID, q.Type, q.Meta)
			q.FormID = form.Id
			created = append(created, q.RemoveInternalData())
			continue
		}
		if q.DeleteQuestion {
			s.DeleteQuestion(q.QuestionID)
			continue
		}
		if q.OverwriteMetadata && q.Type != 0 {
			s.UpdateQuestionTypeAndMetadata(q.QuestionID, q.Type, q.Meta)
		}
		if q.OverwriteMetadata && q.Type == 0 {
			s.UpdateQuestionMetadata(q.QuestionID, q.Meta)
		}
		if !q.OverwriteMetadata && q.Type != 0 {
			s.UpdateQuestionType(q.QuestionID, q.Type)
		}
	}

	err = s.ExecuteSession()
	if err != nil {
		if errors.Is(err, internal_errors.ErrSessionClosed) {
			log.Error("The edit session was already closed when trying to execute changes to edit form.")
			return nil, err
		}
		log.Errorf("Encountered issue while executing edit form session: %s\n", err)
		return nil, err
	}
	return created, nil
}
