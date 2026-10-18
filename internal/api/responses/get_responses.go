package responses

import (
	"errors"
	"gallfeder-forms/internal/api/http_responses"
	"gallfeder-forms/internal/application"
	"net/http"
	"uuid"

	"github.com/go-chi/chi/v5"
	log "github.com/sirupsen/logrus"
)

func GetResponses(w http.ResponseWriter, r *http.Request) {
	log.Debug("Received API request to get response for form!")

	formID := chi.URLParam(r, "formID")
	id, err := uuid.Parse(formID)
	if err != nil {
		log.Debug("Couldn't process the request due to a parameter issue.")
		http_responses.ParameterIssueSpecificHandler(w, "formID")
		return
	}

	resp, err := application.GetResponsesToForm(id)
	if err != nil {
		if errors.Is(err, application.ErrDoesNotExist) {
			http_responses.ParameterIssueHandler(w)
			return
		}
		log.Errorf("Encountered unexpected issue: %s", err)
	}

	http_responses.WriteResponse(resp, w)
}
