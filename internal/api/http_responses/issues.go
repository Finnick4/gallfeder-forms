package http_responses

import (
	"encoding/json"
	"fmt"
	"net/http"

	log "github.com/sirupsen/logrus"
)

type HTTPError struct {
	Code    int
	Message string
}

func writeError(w http.ResponseWriter, message string, code int) {
	resp := HTTPError{
		Code:    code,
		Message: message,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	err := json.NewEncoder(w).Encode(resp)
	if err != nil {
		log.Errorf("Ran into error while writing error response: %s\n", err)
	}
}

var (
	ParameterDecodingIssueHandler = func(w http.ResponseWriter) {
		writeError(w, "Failed to decode the parameters!", http.StatusBadRequest)
	}
	ParameterIssueSpecificHandler = func(w http.ResponseWriter, parameterName string) {
		writeError(w, fmt.Sprintf("There was an issue with the parameter '%s'!", parameterName), http.StatusBadRequest)
	}
	DoesntExistHandler = func(w http.ResponseWriter) {
		writeError(w, fmt.Sprintf("The requested resource does not exist!"), http.StatusNotFound)
	}
	ParameterIssueHandler = func(w http.ResponseWriter) {
		writeError(w, "There was an issue with one of the parameters!", http.StatusBadRequest)
	}
	InternalErrorHandler = func(w http.ResponseWriter) {
		writeError(w, "There was an internal issue!", http.StatusInternalServerError)
	}
)
