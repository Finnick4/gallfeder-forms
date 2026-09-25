package api

import (
	"gallfeder-forms/internal/api/forms"
	"gallfeder-forms/internal/api/middleware"
	"gallfeder-forms/internal/api/responses"
	"gallfeder-forms/internal/api/users"

	"github.com/go-chi/chi/v5"
	chimiddle "github.com/go-chi/chi/v5/middleware"
	cors "github.com/go-chi/cors"
)

func Handler(r *chi.Mux) {
	r.Use(chimiddle.StripSlashes)
	r.Use(middleware.ExtractToken)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"https://*", "http:*"},
	}))

	r.Post("/api/sessions", users.SessionOpenLoginHandler)

	r.Route("/api/forms", func(router chi.Router) {
		router.Post("/", forms.FormCreateHandler)
		router.Get("/{formID}", forms.FormGetHandler)
		router.Patch("/{formID}", forms.FormEditHandler)

		router.Post("/{formID}/responses", responses.ResponseCreateHandler)
	})
}
