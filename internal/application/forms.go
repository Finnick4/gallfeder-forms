package application

import log "github.com/sirupsen/logrus"

func CreateForm(title string, description string) (string, error) {
	if !IsDBSet() {
		log.Error("Aborted creation of new form as no database is set!")
		return "", nil
	}

	if title != "" {

	}

	return "", nil
}
