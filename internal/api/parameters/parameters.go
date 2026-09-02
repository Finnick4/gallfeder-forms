package parameters

import (
	"encoding/json"
	"gallfeder-forms/internal/api/http_responses"
	"io"
	"net/http"

	log "github.com/sirupsen/logrus"
)

func GetParameters[T any](body io.ReadCloser, w http.ResponseWriter) (T, bool) {
	var params T
	err := json.NewDecoder(body).Decode(&params)
	_ = body.Close()

	if err != nil {
		http_responses.ParameterDecodingIssueHandler(w)
		log.Debug("Could not process the request due to parameter issues")
		return params, false
	}

	return params, true
}
