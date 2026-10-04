package application

import (
	"errors"
	"gallfeder-forms/internal/database/db_general"
	"gallfeder-forms/internal/shared"
	"uuid"

	log "github.com/sirupsen/logrus"
)

func CreateSessionForUserLogin(handle string, pw string) (string, error) {
	if !IsDBSet() {
		log.Error("Aborted creation of new session for user as no database is set!")
		return "", ErrNoDBProvider
	}
	token, err := shared.GenerateToken()
	if err != nil {
		return "", ErrUnexpectedIssue
	}

	if !db.AreCorrectUserCredentials(handle, pw) {
		return "", ErrInvalidPassword
	}

	userID, err := db.GetUserIDFromHandle(handle)
	if err != nil {
		return "", ErrInvalidParameters
	}
	sessionID := uuid.New()

	err = db.OpenSessionForUser(userID, sessionID, token)
	if err != nil {
		log.Errorf("Failed to open session for user in the database: %s\n", err)
		return "", ErrUnexpectedIssue
	}
	return token, nil
}

func GetUserIDFromToken(token string) (uuid.UUID, error) {
	if !shared.CouldBeValidToken(token) {
		return uuid.Nil(), ErrInvalidParameters
	}
	if !IsDBSet() {
		log.Error("Aborted creation of new session for user as no database is set!")
		return uuid.Nil(), ErrNoDBProvider
	}

	id, err := db.GetUserIDFromToken(token)
	if err != nil {
		if errors.Is(err, db_general.ErrDBParameterIssue) {
			return uuid.Nil(), ErrInvalidParameters
		}
		log.Errorf("Encountered unexpected issue while getting user id from token: %s\n", err)
		return uuid.Nil(), err
	}
	return id, nil
}
