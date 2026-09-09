package postgresql

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
	"sync"

	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
)

type PostgreSQL struct {
}

var connection *sql.DB

func (db PostgreSQL) getConnection() *sql.DB {
	if connection != nil {
		return connection
	}

	db.connectToDatabase()
	initialiseDatabase()
	return connection
}

func (db PostgreSQL) connectToDatabase() {
	if connection != nil {
		err := db.Close()
		if err != nil {
			log.Error("Encountered error while trying to close PostgreSQL database: %s", err)
		}
	}
	user, ok := os.LookupEnv("POSTGRES_USER")
	if !ok {
		log.Fatal("Can't initialise PostgreSQL database without a user! Please set 'POSTGRES_USER' in the .env!")
	}
	password, ok := os.LookupEnv("POSTGRES_PW")
	if !ok {
		log.Fatal("Can't initialise PostgreSQL database without a password! Please set 'POSTGRES_PW' in the .env!")
	}

	host, ok := os.LookupEnv("POSTGRES_HOST")
	if !ok {
		// @TODO change the default host to be in line with docker container
		host = "localhost"
		log.Warn("'POSTGRES_HOST' is not set in .env. Using default...")
	}

	port, ok := os.LookupEnv("POSTGRES_PORT")
	if !ok {
		port = "5432"
		log.Warn("'POSTGRES_PORT' is not set in .env. Using default...")
	}

	name, ok := os.LookupEnv("POSTGRES_DB")
	if !ok {
		name = "gallfederforms"
		log.Warn("'POSTGRES_NAME' is not set in .env. Using default...")
	}

	connectionString := fmt.Sprintf("postgres://%v:%v@%v:%v/%v?sslmode=disable", user, password, host, port, name)
	var err error
	connection, err = sql.Open("postgres", connectionString)
	if err != nil {
		log.Fatalf("Could not open PostgreSQL database! Maybe the .env file was not correctly populated? Error: %s\n", err)
	}

	row := connection.QueryRow("SELECT version()")
	if row.Err() != nil {
		log.Fatalf("Could not query PostgreSQL database for version!\nAre the connection details correct, is the database reachable or did you set up the database?\nError: %s\n", row.Err())
	}

	var v string
	err = row.Scan(&v)
	if err != nil {
		log.Fatalf("Failed to decode PostgreSQL version! Error: %s\n", err)
	}
	log.Infof("PostgreSQL Version: %s\n", v)
}

func initialiseDatabase() {
	log.Info("Initialising the database.")

	wg := sync.WaitGroup{}

	_, err := connection.Exec(`CREATE TABLE IF NOT EXISTS "forms" (
		"id"				VARCHAR(36) NOT NULL PRIMARY KEY UNIQUE,
		"title"			VARCHAR(64) NOT NULL,
		"description"		TEXT,
		"creation_date"	TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);`)
	if err != nil {
		log.Fatalf("Failed to initialise table 'forms' for PostgreSQL database! Error: %s\n", err)
	}
	go createIndexOnTable("forms", "title", &wg)
	wg.Add(1)

	_, err = connection.Exec(`CREATE TABLE IF NOT EXISTS "questions" (
		"id" 		VARCHAR(36) NOT NULL PRIMARY KEY UNIQUE, 
		"form_id"	VARCHAR(36) NOT NULL,
		"index"		INTEGER NOT NULL,
		"type"		INTEGER NOT NULL,
		"meta"		TEXT NOT NULL,
		CONSTRAINT "fk_questions_form" FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE);`)
	if err != nil {
		log.Fatalf("Failed to initialise table 'questions' for PostgreSQL database! Error: %s\n", err)
	}

	_, err = connection.Exec(`CREATE TABLE IF NOT EXISTS "responses" (
		"id" 				VARCHAR(36) NOT NULL PRIMARY KEY UNIQUE, 
		"form_id"			VARCHAR(36) NOT NULL,
		"submission_date"	TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		"last_change"		TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		CONSTRAINT "fk_responses_form" FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE);`)
	if err != nil {
		log.Fatalf("Failed to initialise table 'responses' for PostgreSQL database! Error: %s\n", err)
	}

	_, err = connection.Exec(`CREATE TABLE IF NOT EXISTS "response_to_question" (
		"response_id" 	VARCHAR(36) NOT NULL, 
		"question_id"	VARCHAR(36) NOT NULL,
		"meta" 			TEXT NOT NULL,
		CONSTRAINT "fk_response_head" FOREIGN KEY(response_id) REFERENCES responses(id) ON DELETE CASCADE,
		CONSTRAINT "fk_response_question" FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
		PRIMARY KEY (response_id, question_id));`)
	if err != nil {
		log.Fatalf("Failed to initialise table 'response_to_question' for PostgreSQL database! Error: %s\n", err)
	}

	wg.Wait()
}

func createIndexOnTable(table string, row string, wg *sync.WaitGroup) {
	if table == "" || row == "" {
		log.Warnf("Did not create index for PostgreSQL table '%s' on row '%s' as one of the two strings is not set!\n", table, row)
		wg.Done()
		return
	}
	statement := fmt.Sprintf(`CREATE INDEX IF NOT EXISTS idx_%v_%v ON %v("%v");`, strings.ToLower(table), strings.ToLower(row), table, row)
	_, err := connection.Exec(statement)
	if err != nil {
		log.Fatalf("Failed to create index for PostgreSQL table '%s' on row '%s'! Error: %s\n", table, row, err)
	}
	wg.Done()
}

func (db PostgreSQL) Close() error {
	err := connection.Close()
	if err != nil {
		log.Errorf("Encountered error while closing PostgreSQL database: %s\n", err)
		return err
	}
	return nil
}

func (db PostgreSQL) Load() {
	_ = db.getConnection()
}
