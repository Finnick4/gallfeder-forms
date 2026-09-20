package shared

import (
	"gallfeder-forms/internal/internal_errors"

	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

func HashPW(toHash string) (string, error) {
	if len(toHash) == 0 || len(toHash) > 72 {
		return "", internal_errors.ErrPWInvalid
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(toHash), 14)
	if err != nil {
		log.Errorf("Encountered unexpected issue while hashing password: %s\n", err)
		return "", internal_errors.ErrUnexpectedIssue
	}
	return string(hashed), nil
}
