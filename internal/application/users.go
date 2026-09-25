package application

import (
	"gallfeder-forms/internal/internal_errors"
	"gallfeder-forms/internal/shared"
	"uuid"

	log "github.com/sirupsen/logrus"
)

func CreateSessionForUserLogin(handle string, pw string) (string, error) {
	if !IsDBSet() {
		log.Error("Aborted creation of new session for user as no database is set!")
		return "", internal_errors.ErrDBNoProvider
	}
	token, err := shared.GenerateToken()
	if err != nil {
		return "", internal_errors.ErrUnexpectedIssue
	}

	userID, err := db.GetUserIDFromHandle(handle)
	if err != nil {
		return "", internal_errors.ErrInvalidParameters
	}
	sessionID := uuid.New()

	err = db.OpenSessionForUser(userID, sessionID, token)
	if err != nil {
		log.Errorf("Failed to open session for user in the database: %s\n", err)
		return "", internal_errors.ErrUnexpectedIssue
	}
	return token, nil
}
