package application

import (
	"gallfeder-forms/internal/database/general"
)

var db general.Database

func SetDatabase(database general.Database) {
	db = database
}
func IsDBSet() bool {
	return db != nil
}
