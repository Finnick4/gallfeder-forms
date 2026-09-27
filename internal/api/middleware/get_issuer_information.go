package middleware

import (
	"context"
	"errors"
	"gallfeder-forms/internal/api/http_responses"
	"gallfeder-forms/internal/application"
	"gallfeder-forms/internal/internal_errors"
	"gallfeder-forms/internal/shared"
	"net/http"
)

func GetRequestIssuerInformation(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Context().Value("token").(string)
		if token == "" || !shared.CouldBeValidToken(token) {
			http_responses.NoTokenHandler(w)
			return
		}

		info := shared.RequestIssuerInformation{
			UsedToken: token,
			// TODO add handle as well
		}
		var err error
		info.ID, err = application.GetUserIDFromToken(token)
		if err != nil {
			if errors.Is(err, internal_errors.ErrInvalidParameters) {
				http_responses.NoTokenHandler(w)
				return
			}
			http_responses.InternalErrorHandler(w)
			return
		}
		info.VerifiedUser = true

		cont := context.WithValue(r.Context(), "user_info", info)
		next.ServeHTTP(w, r.WithContext(cont))
	})
}
