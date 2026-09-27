package postgresql

import (
	"gallfeder-forms/internal/database/db_general"
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
		return shared.ErrPWInvalid
	}

	_, err = conn.Exec(`INSERT INTO users (id, handle, hashed_password) VALUES ($1, $2, $3);`, id.String(), handle, hashedPW)
	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value violates unique constraint") {
			return db_general.ErrDBDuplicatePresent
		}
		log.Errorf(`Ran into issue while creating user: %s\n`, err)
		return db_general.ErrDBGeneralIssue
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

func (db PostgreSQL) OpenSessionForUser(userID uuid.UUID, sessionID uuid.UUID, token string) error {

	hashed := shared.Hash512(token)

	conn := db.getConnection()
	_, err := conn.Exec(`INSERT INTO sessions (id, hashed_token, user_id) VALUES ($1, $2, $3);`, sessionID.String(), hashed, userID.String())
	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value violates unique constraint") {
			return db_general.ErrDBDuplicatePresent
		}
		log.Errorf("Encountered unexpected issue while creating session for user: %s\n", err)
		return db_general.ErrDBUnexpectedIssue
	}

	return nil
}

func (db PostgreSQL) GetUserIDFromHandle(handle string) (uuid.UUID, error) {
	conn := db.getConnection()

	resp := conn.QueryRow(`SELECT id FROM users WHERE handle = $1;`, handle)

	var uuidStr string

	err := resp.Scan(&uuidStr)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return uuid.Nil(), db_general.ErrDBValueNotFound
		}
		log.Errorf("Encountered unexpected issue while getting user's id from handle: %s\n", err)
		return uuid.Nil(), db_general.ErrDBUnexpectedIssue
	}

	id, err := uuid.Parse(uuidStr)
	if err != nil {
		log.Errorf("Failed to parse User UUID from database response: %s\n", err)
		return uuid.Nil(), err
	}

	return id, nil
}

func (db PostgreSQL) GetUserIDFromToken(token string) (uuid.UUID, error) {
	conn := db.getConnection()

	hashed := shared.Hash512(token)

	resp := conn.QueryRow(`SELECT user_id FROM sessions WHERE hashed_token = $1;`, hashed)

	var uuidStr string

	err := resp.Scan(&uuidStr)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return uuid.Nil(), db_general.ErrDBValueNotFound
		}
		log.Errorf("Encountered unexpected issue while getting user's id from token: %s\n", err)
		return uuid.Nil(), db_general.ErrDBUnexpectedIssue
	}

	id, err := uuid.Parse(uuidStr)
	if err != nil {
		log.Errorf("Failed to parse User UUID from database response: %s\n", err)
		return uuid.Nil(), err
	}

	return id, nil
}
