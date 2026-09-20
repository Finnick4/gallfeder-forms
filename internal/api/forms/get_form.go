package forms

import (
	"errors"
	"gallfeder-forms/internal/api/http_responses"
	"gallfeder-forms/internal/application"
	"gallfeder-forms/internal/internal_errors"
	"net/http"
	"uuid"

	"github.com/go-chi/chi/v5"
	log "github.com/sirupsen/logrus"
)

func FormGetHandler(w http.ResponseWriter, r *http.Request) {
	log.Debug("Received API request to get specific form")

	formID := chi.URLParam(r, "formID")
	id, err := uuid.Parse(formID)

	if err != nil {
		log.Debug("Couldn't process the request due to a parameter issue.")
		http_responses.ParameterIssueSpecificHandler(w, "formID")
		return
	}

	form, err := application.GetForm(id)
	if err != nil {
		if errors.Is(err, internal_errors.ErrDBParameterIssue) {
			log.Debug("Failed while processing the request due to a parameter issue.")
			http_responses.ParameterIssueHandler(w)
			return
		}
		if errors.Is(err, internal_errors.ErrDBValueNotFound) {
			log.Debug("The queried ID does not exist.")
			http_responses.DoesntExistHandler(w)
			return
		}
		log.Errorf("Unhandled error within FormGetHandler: %s\n", err)
		http_responses.InternalErrorHandler(w)
		return
	}

	http_responses.WriteResponse(form, w)
}
