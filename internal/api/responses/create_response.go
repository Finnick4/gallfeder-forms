package responses

import (
	"errors"
	"gallfeder-forms/internal/api/http_responses"
	param "gallfeder-forms/internal/api/parameters"
	"gallfeder-forms/internal/application"
	"net/http"
	"uuid"

	"github.com/go-chi/chi/v5"
	log "github.com/sirupsen/logrus"
)

func ResponseCreateHandler(w http.ResponseWriter, r *http.Request) {
	log.Debug("Received API request to create new response to form")

	formID := chi.URLParam(r, "formID")
	id, err := uuid.Parse(formID)
	if err != nil {
		log.Debug("Couldn't process the request due to a parameter issue.")
		http_responses.ParameterIssueSpecificHandler(w, "formID")
		return
	}

	params, ok := param.GetParameters[param.ParamsResponseCreate](r.Body, w)
	if !ok {
		return
	}

	responseID, err := application.CreateResponse(id, params.Answers)

	if err != nil {
		if errors.Is(err, application.ErrInvalidParameters) {
			log.Debug("Failed while processing the request due to a parameter issue.")
			http_responses.ParameterIssueHandler(w)
			return
		}
		log.Errorf("Unhandled error within ResponseCreateHandler: %s\n", err)
		http_responses.InternalErrorHandler(w)
		return
	}

	http_responses.WriteResponse(responseID, w)
}
