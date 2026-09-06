package api

import (
	"gallfeder-forms/internal/api/forms"

	"github.com/go-chi/chi/v5"
	chimiddle "github.com/go-chi/chi/v5/middleware"
)

func Handler(r *chi.Mux) {
	r.Use(chimiddle.StripSlashes)

	r.Route("/api/forms", func(router chi.Router) {
		router.Post("/", forms.FormCreateHandler)
		router.Get("/{formID}", forms.FormGetHandler)
		router.Patch("/{formID}", forms.FormEditHandler)

	})
}
