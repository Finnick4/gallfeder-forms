package db_general

import (
	"gallfeder-forms/internal/shared"
	"uuid"
)

type Database interface {
	CreateFormWithDescription(userID uuid.UUID, id uuid.UUID, title string, description string) error
	CreateForm(userID uuid.UUID, id uuid.UUID, title string) error
	GetForm(id uuid.UUID) (shared.Form, error)
	GetFormEditors(id uuid.UUID) (shared.FormEditors, error)
	GetFormOverviewsOfOwner(userID uuid.UUID) ([]shared.FormOverview, error)
	StartFormEditSession(formID uuid.UUID) (FormEditSession, error)

	CreateResponse(responseID uuid.UUID, formID uuid.UUID, answers []shared.QuestionAnswer) error
	GetFormResponses(id uuid.UUID) (shared.FormResponses, error)

	CreateUser(id uuid.UUID, handle string, password string) error
	AreCorrectUserCredentials(handle string, password string) bool
	AnyUsersExistent() bool

	OpenSessionForUser(userID uuid.UUID, sessionID uuid.UUID, token string) error
	GetUserIDFromHandle(handle string) (uuid.UUID, error)
	GetUserIDFromToken(token string) (uuid.UUID, error)

	Close() error
	Load()
}

type FormEditSession interface {
	EditTitle(title string)
	EditDescription(description string)
	EditTitleAndDescription(title string, description string)
	RemoveDescription()

	CreateQuestion(questionID uuid.UUID, questionType shared.QuestionType, meta shared.QuestionMetaData)
	UpdateQuestionMetadata(questionID uuid.UUID, meta shared.QuestionMetaData)
	UpdateQuestionType(questionID uuid.UUID, questionType shared.QuestionType)
	UpdateQuestionTypeAndMetadata(questionID uuid.UUID, questionType shared.QuestionType, meta shared.QuestionMetaData)
	DeleteQuestion(questionID uuid.UUID)

	ExecuteSession() error
	AbortSession() error
}
