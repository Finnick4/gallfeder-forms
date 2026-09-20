package postgresql

import (
	"gallfeder-forms/internal/internal_errors"
	"gallfeder-forms/internal/shared"
	"strings"
	"uuid"

	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

func (db PostgreSQL) CreateUser(id uuid.UUID, handle string, password string) error {
	conn := db.getConnection()

	hashedPW, err := shared.HashPW(password)
	if err != nil {
		return internal_errors.ErrPWInvalid
	}

	_, err = conn.Exec(`INSERT INTO users (id, handle, hashed_password) VALUES ($1, $2, $3);`, id.String(), handle, hashedPW)
	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value violates unique constraint") {
			return internal_errors.ErrDBDuplicatePresent
		}
		log.Errorf(`Ran into issue while creating user: %s\n`, err)
		return internal_errors.ErrDBGeneralIssue
	}

	return nil
}

func (db PostgreSQL) AreCorrectUserCredentials(handle string, password string) bool {
	conn := db.getConnection()

	resp := conn.QueryRow(`SELECT hashed_password FROM users WHERE handle = $1;`, handle)

	var hashedPW string

	err := resp.Scan(&hashedPW)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return false
		}
		log.Errorf("Encountered unexpected issue while getting user's hashed password to verify credentials: %s\n", err)
		return false
	}

	return bcrypt.CompareHashAndPassword([]byte(hashedPW), []byte(password)) == nil
}
