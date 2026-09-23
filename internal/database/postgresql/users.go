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

func (db PostgreSQL) AnyUsersExistent() bool {
	conn := db.getConnection()
	resp := conn.QueryRow(`SELECT id FROM users LIMIT 1;`)

	var id string

	err := resp.Scan(&id)
	return err == nil
}

func (db PostgreSQL) OpenSessionForUser(id uuid.UUID) (uuid.UUID, string, error) {
	token, err := shared.GenerateToken()
	if err != nil {
		return uuid.Nil(), "", internal_errors.ErrDBUnexpectedIssue
	}

	hashed := shared.Hash512(token)
	sessionID := uuid.New()

	conn := db.getConnection()
	_, err = conn.Exec(`INSERT INTO sessions (id, hashed_token, user_id) VALUES ($1, $2, $3);`, sessionID.String(), hashed, id.String())
	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value violates unique constraint") {
			return db.OpenSessionForUser(id)
		}
		log.Errorf("Encountered unexpected issue while creating session for user: %s\n", err)
		return uuid.Nil(), "", internal_errors.ErrDBUnexpectedIssue
	}

	return sessionID, token, nil
}
