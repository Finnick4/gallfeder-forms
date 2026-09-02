package http_responses

import (
	"encoding/json"
	"net/http"

	log "github.com/sirupsen/logrus"
)

type SuccessResponse struct {
	Code int
	Data any
}

type BarebonesResponse struct {
	Code int
}

func WriteResponse(data any, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")

	var err error

	if data == nil {
		err = json.NewEncoder(w).Encode(BarebonesResponse{
			Code: 200,
		})
	} else {
		err = json.NewEncoder(w).Encode(SuccessResponse{
			Code: 200,
			Data: data,
		})
	}

	if err != nil {
		log.Errorf("Failed to encode response to send it back to the client: %s\n", err)
		return
	}
}
