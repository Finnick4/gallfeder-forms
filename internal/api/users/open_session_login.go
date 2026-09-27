package users

import (
	"errors"
	"gallfeder-forms/internal/api/http_responses"
	param "gallfeder-forms/internal/api/parameters"
	"gallfeder-forms/internal/application"
	"gallfeder-forms/internal/shared"
	"net/http"

	log "github.com/sirupsen/logrus"
)

func SessionOpenLoginHandler(w http.ResponseWriter, r *http.Request) {
	log.Debug("Received API request to open session for user via login")

	params, ok := param.GetParameters[param.ParamsUserLoginCredentials](r.Body, w)
	if !ok {
		return
	}

	if !shared.IsPermittedHandle(params.UserHandle) {
		http_responses.ParameterIssueSpecificHandler(w, "handle")
		return
	}
	if !shared.IsPermittedPassword(params.Password) {
		http_responses.ParameterIssueSpecificHandler(w, "password")
		return
	}

	token, err := application.CreateSessionForUserLogin(params.UserHandle, params.Password)
	if err != nil {
		if errors.Is(err, application.ErrInvalidParameters) {
			http_responses.ParameterIssueHandler(w)
			log.Debug("Could not open a session for user as there was a parameter issue!")
			return
		}
		http_responses.InternalErrorHandler(w)
		return
	}

	cookieToken := http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		MaxAge:   2592000,
		Secure:   false, // TODO add option to use secure token
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, &cookieToken)

	cookieIsLoggedIn := http.Cookie{
		Name:     "isLoggedIn",
		Value:    "true",
		Path:     "/",
		MaxAge:   2592000,
		Secure:   false,
		HttpOnly: false,
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, &cookieIsLoggedIn)

	http_responses.WriteResponse(nil, w)
}
