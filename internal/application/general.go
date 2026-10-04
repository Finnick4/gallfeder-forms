package application

import (
	"gallfeder-forms/internal/database/db_general"
	"uuid"

	log "github.com/sirupsen/logrus"
)

var db db_general.Database

func SetDatabase(database db_general.Database) {
	db = database
	db.Load()
	if !db.AnyUsersExistent() {
		log.Info("Creating default admin user")
		err := db.CreateUser(uuid.New(), "admin", "admin123!")
		if err != nil {
			log.Errorf("Encountered issue while creating default admin user: %s\n", err)
			return
		}
	}
}
func IsDBSet() bool {
	return db != nil
}
