package shared

import (
	"crypto/rand"
	"crypto/sha512"
	"encoding/hex"
	"gallfeder-forms/internal/internal_errors"
	"strings"

	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

func IsPermittedPassword(pw string) bool {
	return len(pw) >= 8 && len(pw) <= 72 && !strings.Contains(pw, " ")
}
func IsPermittedHandle(handle string) bool {
	return len(handle) >= 2 && len(handle) <= 32 && !strings.ContainsAny(handle, " \n")
}

func HashPW(toHash string) (string, error) {
	if !IsPermittedPassword(toHash) {
		return "", internal_errors.ErrPWInvalid
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(toHash), 14)
	if err != nil {
		log.Errorf("Encountered unexpected issue while hashing password: %s\n", err)
		return "", internal_errors.ErrUnexpectedIssue
	}
	return string(hashed), nil
}

func GenerateToken() (string, error) {
	bytes := make([]byte, 32)
	_, err := rand.Read(bytes)
	if err != nil {
		log.Errorf("Encountered issue while reading random bytes to create token: %s\n", err)
		return "", internal_errors.ErrUnexpectedIssue
	}
	var controlByte byte = 0
	for i, b := range bytes {
		if i > 30 {
			break
		}
		controlByte += b
	}
	bytes[31] = controlByte

	return hex.EncodeToString(bytes), nil
}

func CouldBeValidToken(proposed string) bool {
	if len(proposed) != 64 {
		return false
	}
	bytes, err := hex.DecodeString(proposed)
	if err != nil {
		return false
	}
	var calcControl byte = 0
	for i, b := range bytes {
		if i > 30 {
			break
		}
		calcControl += b
	}
	return bytes[31] == calcControl
}

func Hash512(toHash string) string {
	hashed := sha512.Sum512([]byte(toHash))
	return hex.EncodeToString(hashed[:])
}
