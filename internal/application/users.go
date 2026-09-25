package application

import (
	"errors"
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

func GetUserIDFromToken(token string) (uuid.UUID, error) {
	if !shared.CouldBeValidToken(token) {
		return uuid.Nil(), internal_errors.ErrInvalidParameters
	}
	if !IsDBSet() {
		log.Error("Aborted creation of new session for user as no database is set!")
		return uuid.Nil(), internal_errors.ErrDBNoProvider
	}

	id, err := db.GetUserIDFromToken(token)
	if err != nil {
		if errors.Is(err, internal_errors.ErrDBParameterIssue) {
			return uuid.Nil(), internal_errors.ErrInvalidParameters
		}
		log.Errorf("Encountered unexpected issue while getting user id from token: %s\n", err)
		return uuid.Nil(), err
	}
	return id, nil
}
