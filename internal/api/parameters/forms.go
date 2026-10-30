package parameters

import "gallfeder-forms/internal/shared"

type ParamsFormCreate struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}
type ParamsFormEdit struct {
	Title             string
	Description       string
	RemoveDescription bool

	QuestionChanges []ParamsQuestionChange
}

type ParamsQuestionChange struct {
	Id                string // if set, change edit the question, if not, create a new question
	Metadata          shared.QuestionMetaData
	Index             int
	QuestionType      shared.QuestionType
	DeleteQuestion    bool
	OverwriteMetadata bool
}
