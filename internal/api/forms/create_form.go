package forms

import (
	"errors"
	"gallfeder-forms/internal/api/http_responses"
	param "gallfeder-forms/internal/api/parameters"
	"gallfeder-forms/internal/application"
	"gallfeder-forms/internal/internal_errors"
	"net/http"
	"strings"

	log "github.com/sirupsen/logrus"
)

func FormCreateHandler(w http.ResponseWriter, r *http.Request) {
	log.Debug("Received API request to create new form")
	// @TODO Auth

	params, ok := param.GetParameters[param.ParamsFormCreate](r.Body, w)
	if !ok {
		return
	}

	if strings.TrimSpace(params.Title) == "" || len(params.Title) > 64 {
		log.Debug("Couldn't process the request due to a parameter issue.")
		http_responses.ParameterIssueSpecificHandler(w, "Title")
		return
	}

	id, err := application.CreateForm(params.Title, params.Description)
	if err != nil {
		if errors.Is(err, internal_errors.ErrDBParameterIssue) {
			log.Debug("Failed while processing the request due to a parameter issue.")
			http_responses.ParameterIssueHandler(w)
			return
		}
		log.Errorf("Unhandled error within FormCreateHandler: %s\n", err)
		http_responses.InternalErrorHandler(w)
		return
	}

	http_responses.WriteResponse(id, w)
}
