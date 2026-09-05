package shared

import (
	"encoding/base64"

	log "github.com/sirupsen/logrus"
)

func EncodeBase64(input string) string {
	data := make([]byte, base64.StdEncoding.EncodedLen(len(input)))

	base64.StdEncoding.Encode(data, []byte(input))

	return string(data)
}

func DecodeBase64(input string) (string, error) {
	data := make([]byte, base64.StdEncoding.DecodedLen(len(input)))

	n, err := base64.StdEncoding.Decode(data, []byte(input))
	if err != nil {
		log.Errorf("Failed to decode base64: %s\n", err)
		return "", err
	}

	return string(data[:n]), nil
}
