package shared

import "uuid"

type QuestionType int

const (
	QuestionTypeChoice QuestionType = iota
	QuestionTypeString
)

type QuestionMetaData struct {
	Question       string
	ChoiceOptions  []ChoiceQuestionOption
	MaximumChoices int
}

type ChoiceQuestionOption struct {
	Text string
}

type Question struct {
	FormID     uuid.UUID
	QuestionID uuid.UUID
	Index      int
	Type       QuestionType
	Meta       QuestionMetaData
}
