package forms

import (
	"errors"
	"gallfeder-forms/internal/api/http_responses"
	"gallfeder-forms/internal/application"
	"gallfeder-forms/internal/shared"
	"net/http"

	log "github.com/sirupsen/logrus"
)

func FormGetEditableHandler(w http.ResponseWriter, r *http.Request) {
	log.Debug("Received API request to get editable forms for user")

	uinfo := r.Context().Value("user_info").(shared.RequestIssuerInformation)
	if !uinfo.VerifiedUser {
		http_responses.NoTokenHandler(w)
		return
	}

	overviews, err := application.GetEditableFormsOverviewsForUserID(uinfo.ID)
	if err != nil {
		if errors.Is(err, application.ErrDoesNotExist) {
			// Either invalid user or the user cannot edit any forms
			http_responses.WriteResponse([]shared.FormOverview{}, w)
			return
		}
		log.Errorf("Encountered unexpected issue while getting overviews of forms a user can edit: %s\n", err)
		http_responses.InternalErrorHandler(w)
		return
	}

	http_responses.WriteResponse(overviews, w)
}
