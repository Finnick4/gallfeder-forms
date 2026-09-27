package forms

import (
	"errors"
	"gallfeder-forms/internal/api/http_responses"
	param "gallfeder-forms/internal/api/parameters"
	"gallfeder-forms/internal/application"
	"gallfeder-forms/internal/internal_errors"
	"gallfeder-forms/internal/shared"
	"net/http"
	"strings"
	"uuid"

	"github.com/go-chi/chi/v5"
	log "github.com/sirupsen/logrus"
)

func FormEditHandler(w http.ResponseWriter, r *http.Request) {
	log.Debug("Received API request to edit form")
	uinfo := r.Context().Value("user_info").(shared.RequestIssuerInformation)
	if !uinfo.VerifiedUser {
		http_responses.NoTokenHandler(w)
		return
	}

	formID := chi.URLParam(r, "formID")
	id, err := uuid.Parse(formID)
	if err != nil {
		log.Debug("Couldn't process the request due to a parameter issue.")
		http_responses.ParameterIssueSpecificHandler(w, "formID")
		return
	}

	editors, err := application.GetFormEditors(id)
	if err != nil {
		if errors.Is(err, internal_errors.ErrInvalidParameters) {
			log.Debug("Couldn't process the request due to a parameter issue.")
			http_responses.ParameterIssueSpecificHandler(w, "formID")
			return
		}
		log.Errorf("Unhandled error within FormEditHandler: %s\n", err)
		http_responses.InternalErrorHandler(w)
		return
	}

	if !editors.CanEditForm(uinfo.ID) {
		log.Debug("Couldn't process the request as the sender does not bear sufficient permissions.")
		http_responses.NotEditorHandler(w)
		return
	}

	params, ok := param.GetParameters[param.ParamsFormEdit](r.Body, w)
	if !ok {
		return
	}

	if strings.TrimSpace(params.Title) == "" {
		params.Title = ""
	}

	if len(params.Title) > 64 {
		log.Debug("Couldn't process the request due to a parameter issue.")
		http_responses.ParameterIssueSpecificHandler(w, "Title")
		return
	}

	form := shared.Form{
		Id:          id,
		Title:       params.Title,
		Description: params.Description,
	}

	var questions []shared.QuestionEdit
	var deletedQuestions []uuid.UUID

	for _, change := range params.QuestionChanges {
		var q shared.QuestionEdit
		if change.Id != "" {
			q.QuestionID, err = uuid.Parse(change.Id)
			if err != nil {
				log.Debug("Couldn't process the request due to a parameter issue.")
				http_responses.ParameterIssueSpecificHandler(w, "QuestionChanges.Id")
				return
			}
		}
		if change.DeleteQuestion {
			deletedQuestions = append(deletedQuestions, q.QuestionID)
			continue
		}

		if change.QuestionType != 0 {
			q.Type = change.QuestionType
		}
		if change.Index != 0 {
			q.Index = change.Index
		}
		if change.OverwriteMetadata || change.Id == "" {
			q.Meta = change.Metadata
			q.OverwriteMetadata = true
		}
		questions = append(questions, q)
	}

	created, err := application.EditForm(form, params.RemoveDescription, questions)
	if err != nil {
		if errors.Is(err, internal_errors.ErrDBParameterIssue) {
			log.Debug("Failed while processing the request due to a parameter issue.")
			http_responses.ParameterIssueHandler(w)
			return
		}
		log.Errorf("Unhandled error within FormEditHandler: %s\n", err)
		http_responses.InternalErrorHandler(w)
		return
	}

	http_responses.WriteResponse(created, w)
}
