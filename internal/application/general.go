package application

import (
	"errors"
	"gallfeder-forms/internal/database/general"
	"gallfeder-forms/internal/internal_errors"
	"uuid"

	log "github.com/sirupsen/logrus"
)

var db general.Database

func SetDatabase(database general.Database) {
	db = database
	err := db.CreateForm(uuid.NewV4(), "test")
	if err != nil && errors.Is(err, internal_errors.ErrDuplicatePresent) {
		log.Debug("Duplicate")
	}
}
func IsDBSet() bool {
	return db != nil
}
