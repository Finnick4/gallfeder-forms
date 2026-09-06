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

type QuestionEdit struct {
	FormID     uuid.UUID
	QuestionID uuid.UUID
	Index      int
	Type       QuestionType
	Meta       QuestionMetaData

	DeleteQuestion    bool
	OverwriteMetadata bool
}

func (q QuestionEdit) RemoveInternalData() Question {
	return Question{
		FormID:     q.FormID,
		QuestionID: q.QuestionID,
		Index:      q.Index,
		Type:       q.Type,
		Meta:       q.Meta,
	}
}
