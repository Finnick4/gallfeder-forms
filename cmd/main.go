package main

import (
	"gallfeder-forms/internal/api"
	"gallfeder-forms/internal/application"
	"gallfeder-forms/internal/database/postgresql"
	"net/http"

	"github.com/joho/godotenv"

	"github.com/go-chi/chi/v5"
	log "github.com/sirupsen/logrus"
)

func main() {
	log.SetLevel(log.DebugLevel)

	err := godotenv.Load(".env")
	if err != nil {
		log.Warnf("Failed to load .env variables: %s", err)
	}

	db := postgresql.PostgreSQL{}
	application.SetDatabase(db)

	var r *chi.Mux = chi.NewRouter()
	api.Handler(r)

	err = http.ListenAndServe(":8080", r)
	_ = db.Close()
	if err != nil {
		log.Fatal(err)
	}
}
