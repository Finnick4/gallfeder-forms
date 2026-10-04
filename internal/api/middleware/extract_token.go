package middleware

import (
	"context"
	"errors"
	"gallfeder-forms/internal/api/http_responses"
	"net/http"
)

func ExtractToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("token")
		if err != nil {
			if errors.Is(err, http.ErrNoCookie) {
				cont := context.WithValue(r.Context(), "token", "")
				next.ServeHTTP(w, r.WithContext(cont))
				return
			}

			http_responses.InternalErrorHandler(w)
			return
		}

		cont := context.WithValue(r.Context(), "token", cookie.Value)
		next.ServeHTTP(w, r.WithContext(cont))
	})
}
